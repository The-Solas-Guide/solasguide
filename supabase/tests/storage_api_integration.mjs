import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function localStatus() {
  const output = execFileSync("supabase", ["status", "--output", "env"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const values = {};
  for (const line of output.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)="(.*)"$/);
    if (match) values[match[1]] = match[2];
  }
  return values;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectStorageError(operation, label) {
  const result = await operation();
  assert(result.error, `${label} unexpectedly succeeded`);
  return result.error;
}

async function expectStorageListingDenied(operation, label) {
  const result = await operation();
  assert(
    result.error || (result.data?.length ?? 0) === 0,
    `${label} exposed storage objects`,
  );
  return result.error;
}

async function expectStorageMutationDenied(operation, label, admin, objectPath, expectedPresent) {
  const result = await operation();
  const listing = await admin.storage.from("profile-images").list("integration", { limit: 100 });
  assert(!listing.error, `${label} verification listing failed: ${listing.error?.message}`);
  const objectName = objectPath.slice(objectPath.lastIndexOf("/") + 1);
  const present = listing.data?.some((object) => object.name === objectName) ?? false;
  assert(present === expectedPresent, `${label} changed storage state unexpectedly`);
  assert(result.error || present === expectedPresent, `${label} unexpectedly succeeded`);
  return result.error;
}

const status = localStatus();
const apiUrl = status.API_URL;
const anonKey = status.ANON_KEY;
const serviceRoleKey = status.SERVICE_ROLE_KEY;

assert(
  apiUrl && /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(apiUrl),
  `Refusing to run outside the local Supabase API: ${apiUrl ?? "missing URL"}`,
);
assert(anonKey && serviceRoleKey, "Local Supabase keys are unavailable");

const suffix = randomUUID().slice(0, 8);
const password = `local-only-${randomUUID()}-Aa1!`;
const adminEmail = `storage-admin-${suffix}@example.test`;
const userEmail = `storage-user-${suffix}@example.test`;
const path = `integration/${suffix}.png`;
const anonymousPath = `${path}.anonymous`;
const nonAdminPath = `${path}.non-admin`;
const invalidPath = `integration/${suffix}.txt`;
const oversizedPath = `integration/${suffix}-oversized.jpg`;

const service = createClient(apiUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anonymous = createClient(apiUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let adminId;
let userId;
let admin;
let user;

try {
  const adminCreated = await service.auth.admin.createUser({
    email: adminEmail,
    password,
    email_confirm: true,
  });
  assert(!adminCreated.error, `could not create local admin: ${adminCreated.error?.message}`);
  adminId = adminCreated.data.user?.id;
  assert(adminId, "local admin user was not returned");

  const allowlisted = await service.from("admin_users").insert({ user_id: adminId });
  assert(!allowlisted.error, `could not allowlist local admin: ${allowlisted.error?.message}`);

  const userCreated = await service.auth.admin.createUser({
    email: userEmail,
    password,
    email_confirm: true,
  });
  assert(!userCreated.error, `could not create local non-admin: ${userCreated.error?.message}`);
  userId = userCreated.data.user?.id;
  assert(userId, "local non-admin user was not returned");

  const adminAuth = createClient(apiUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const adminLogin = await adminAuth.auth.signInWithPassword({ email: adminEmail, password });
  assert(!adminLogin.error && adminLogin.data.session, `could not sign in local admin: ${adminLogin.error?.message}`);
  admin = createClient(apiUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await admin.auth.setSession(adminLogin.data.session);

  const userAuth = createClient(apiUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userLogin = await userAuth.auth.signInWithPassword({ email: userEmail, password });
  assert(!userLogin.error && userLogin.data.session, `could not sign in local non-admin: ${userLogin.error?.message}`);
  user = createClient(apiUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await user.auth.setSession(userLogin.data.session);

  const uploaded = await admin.storage.from("profile-images").upload(path, Buffer.from("initial image"), {
    contentType: "image/png",
    upsert: false,
  });
  assert(!uploaded.error, `administrator upload failed: ${uploaded.error?.message}`);

  await expectStorageListingDenied(
    () => anonymous.storage.from("profile-images").list("integration", { limit: 100 }),
    "anonymous profile image listing",
  );
  await expectStorageMutationDenied(
    () => anonymous.storage.from("profile-images").upload(anonymousPath, Buffer.from("anonymous"), { contentType: "image/png" }),
    "anonymous profile image upload",
    admin,
    anonymousPath,
    false,
  );
  await expectStorageMutationDenied(
    () => anonymous.storage.from("profile-images").update(path, Buffer.from("anonymous update"), { contentType: "image/png" }),
    "anonymous profile image update",
    admin,
    path,
    true,
  );
  await expectStorageMutationDenied(
    () => anonymous.storage.from("profile-images").remove([path]),
    "anonymous profile image delete",
    admin,
    path,
    true,
  );

  await expectStorageListingDenied(
    () => user.storage.from("profile-images").list("integration", { limit: 100 }),
    "non-admin profile image listing",
  );
  await expectStorageMutationDenied(
    () => user.storage.from("profile-images").upload(nonAdminPath, Buffer.from("non-admin"), { contentType: "image/png" }),
    "non-admin profile image upload",
    admin,
    nonAdminPath,
    false,
  );
  await expectStorageMutationDenied(
    () => user.storage.from("profile-images").update(path, Buffer.from("non-admin update"), { contentType: "image/png" }),
    "non-admin profile image update",
    admin,
    path,
    true,
  );
  await expectStorageMutationDenied(
    () => user.storage.from("profile-images").remove([path]),
    "non-admin profile image delete",
    admin,
    path,
    true,
  );

  const adminListing = await admin.storage.from("profile-images").list("integration", { limit: 100 });
  assert(!adminListing.error, `administrator listing failed: ${adminListing.error?.message}`);
  assert(adminListing.data?.some((object) => object.name === `${suffix}.png`), "administrator cannot list uploaded object");

  const invalidMime = await expectStorageError(
    () => admin.storage.from("profile-images").upload(invalidPath, Buffer.from("not an image"), { contentType: "text/plain" }),
    "invalid MIME profile image upload",
  );
  assert(/mime|type|415|400/i.test(invalidMime.message), `invalid MIME failed for an unexpected reason: ${invalidMime.message}`);

  const oversized = await expectStorageError(
    () => admin.storage.from("profile-images").upload(oversizedPath, Buffer.alloc(5 * 1024 * 1024 + 1), { contentType: "image/jpeg" }),
    "oversized profile image upload",
  );
  assert(/size|large|413|400/i.test(oversized.message), `oversized upload failed for an unexpected reason: ${oversized.message}`);

  const updated = await admin.storage.from("profile-images").update(path, Buffer.from("updated image"), {
    contentType: "image/webp",
  });
  assert(!updated.error, `administrator update failed: ${updated.error?.message}`);

  const publicUrl = admin.storage.from("profile-images").getPublicUrl(path).data.publicUrl;
  const publicResponse = await fetch(publicUrl);
  assert(publicResponse.ok, `public profile image URL failed: HTTP ${publicResponse.status}`);

  const removed = await admin.storage.from("profile-images").remove([path]);
  assert(!removed.error, `administrator Storage API delete failed: ${removed.error?.message}`);

  const afterDelete = await admin.storage.from("profile-images").list("integration", { limit: 100 });
  assert(!afterDelete.error, `administrator post-delete listing failed: ${afterDelete.error?.message}`);
  assert(!afterDelete.data?.some((object) => object.name === `${suffix}.png`), "deleted object still appears in Storage listing");

  console.log("Storage API integration passed: anonymous/non-admin denial, admin CRUD, MIME/size limits, public URL, and listing controls.");
} finally {
  // The Storage API owns object deletion. Service-role cleanup handles failures
  // before an authenticated administrator client is available.
  await service.storage.from("profile-images").remove([
    path,
    anonymousPath,
    nonAdminPath,
    invalidPath,
    oversizedPath,
  ]);
  if (userId) await service.auth.admin.deleteUser(userId);
  if (adminId) await service.auth.admin.deleteUser(adminId);
}
