import React from "react";

type MetaTagProps = {
  title: string;
  description: string;
};

type Props = {
  children: React.ReactNode;
  metatags: MetaTagProps[];
};

export type Content12Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Content12 = (props: Content12Props) => {
  const { children, metatags } = {
    ...Content12Defaults,
    ...props,
  };

  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container max-w-lg">
        <div className="mb-8 grid grid-cols-2 gap-6 md:mb-10 md:grid-cols-4 md:gap-8 lg:mb-12">
          {metatags.map((item, index) => (
            <div key={index}>
              <h3 className="mb-2 text-h6 font-display">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="prose-base max-w-full prose-p:m-0 prose-p:mb-4 prose-p:leading-[1.5]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Content12Defaults: Props = {
  metatags: [
    {
      title: "Label",
      description: "Lorem ipsum",
    },
    {
      title: "Label",
      description: "Lorem ipsum",
    },
    {
      title: "Label",
      description: "Lorem ipsum",
    },
    {
      title: "Label",
      description: "Lorem ipsum",
    },
  ],
  children: (
    <React.Fragment>
      <p>
        Morbi sed imperdiet in ipsum, adipiscing elit dui lectus. Tellus id scelerisque est
        ultricies ultricies. Duis est sit sed leo nisl, blandit elit sagittis. Quisque tristique
        consequat quam sed. Nisl at scelerisque amet nulla purus habitasse.
      </p>
      <p>
        Nunc sed faucibus bibendum feugiat sed interdum. Ipsum egestas condimentum mi massa. In
        tincidunt pharetra consectetur sed duis facilisis metus. Etiam egestas in nec sed et. Quis
        lobortis at sit dictum eget nibh tortor commodo cursus.
      </p>
      <p>
        Odio felis sagittis, morbi feugiat tortor vitae feugiat fusce aliquet. Nam elementum urna
        nisi aliquet erat dolor enim. Ornare id morbi eget ipsum. Aliquam senectus neque ut id eget
        consectetur dictum. Donec posuere pharetra odio consequat scelerisque et, nunc tortor. Nulla
        adipiscing erat a erat. Condimentum lorem posuere gravida enim posuere cursus diam.
      </p>
    </React.Fragment>
  ),
};
