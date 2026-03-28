// ABOUTME: Configures the Astro/Starlight site metadata, routing, and sidebar.
// ABOUTME: Keeps deployment-specific URL settings in one place for the docs site.
// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://kotowari-modoki.github.io/",
  base: "/manabi-commons",
  integrations: [
    starlight({
      title: "まなびコモンズ",
      description: "小学生・中学生のための無料教科書",
      // logo: {
      //   src: "./public/logo.svg",
      // },
      //
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/kotowari-modoki/manabi-commons",
        },
      ],
      sidebar: [
        {
          label: "算数・数学",
          autogenerate: { directory: "math" },
        },
        {
          label: "理科",
          autogenerate: { directory: "science" },
        },
        {
          label: "英語",
          autogenerate: { directory: "english" },
        },
        {
          label: "社会",
          autogenerate: { directory: "social" },
        },
        {
          label: "国語",
          autogenerate: { directory: "japanese" },
        },
      ],
      // customCss: ["./src/styles/custom.css"],
      editLink: {
        baseUrl: "https://github.com/kotowari-modoki/manabi-commons/edit/main/",
      },
    }),
  ],
});
