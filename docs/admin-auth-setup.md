# Admin Auth setup

The Admin CMS uses Supabase email OTP authentication.

## Create the administrator

1. Create the approved user in Supabase Authentication.
2. Copy the user's UUID.
3. Insert the UUID into `public.admin_users` using the Supabase SQL editor.
4. Do not add the administrator's email address to application code.

```sql
insert into public.admin_users (user_id)
values ('00000000-0000-0000-0000-000000000000');
```

## Configure hosted email delivery

1. Open Supabase Authentication settings.
2. Enable custom SMTP.
3. Enter the MailerSend SMTP host, port, username, password, sender address, and sender name.
4. Set the Magic Link template to show `{{ .Token }}` instead of a link.
5. Set the email OTP expiry to 600 seconds.
6. Disable new user signups.
7. Add the production and preview application URLs to the redirect allowlist.

Local Supabase sends these emails to its local email capture service. It uses
`supabase/templates/admin-sign-in.html` for the six-digit code email.
