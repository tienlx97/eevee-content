// Plop script for templating out a converged mdx post
import { NodePlopAPI } from "plop";
import { getAuthor } from "./getAuthor";
import { findGitRoot } from "../../monorepo/index";
import { nextId } from "../../uuid/index";

const root = findGitRoot();

interface Answers {
  postType: string;
  title: string;
  description: string;
  date: string;
  author: string;
  categories: string;
  keywords: string;
}

interface Data {
  postId?: string;
  title: string;
  description: string;
  date: string;
  authorDetail: {
    name: string;
    url: string;
    id: number;
  };
  categoryList: string[];
  keywordList: string[];
  slugifyTitle: string;
}

function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

function formatDate(date: Date) {
  return [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join("/");
}

module.exports = (plop: NodePlopAPI) => {
  plop.setWelcomeMessage(
    "This utility is a helper to create converged Mdx post"
  );

  plop.setGenerator("post", {
    description: "New Mdx post",

    prompts: [
      {
        type: "list",
        name: "postType",
        message: "Which post type do you want?",
        choices: ["stories", "diary"],
        validate: (packageName: string) =>
          ["stories", "diary"].includes(packageName),
      },
      {
        type: "input",
        name: "title",
        message: "Title",
        default: "My first blog",
        validate: (input: string) => !!input || "Must enter a title",
      },
      {
        type: "input",
        name: "description",
        message: "Description",
        default: "This is my first blog",
        validate: (input: string) => !!input || "Must enter a description",
      },
      {
        type: "input",
        name: "date",
        message: "Creation date (ex: 06/09/2069)",
        default: formatDate(new Date()),
        validate: (input: string) =>
          /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/.test(
            input
          ) || "Must enter valid date dd/mm/yyyy",
      },
      {
        type: "input",
        name: "author",
        message: "Author (ex: tienlx97)",
        default: "tienlx97",
        validate: (input: string) => !!input || "Must enter author",
      },
      {
        type: "input",
        name: "categories",
        message: "category",
        default: "react",
        // validate: (input: string) => !!input || 'Must enter a categories',
      },
      {
        type: "input",
        name: "keywords",
        message: "some keywords",
        default: "react typescript",
        // validate: (input: string) => !!input || 'Must enter a categories',
      },
    ],

    actions: (answers) => {
      const { categories, author, keywords, ...rest } = answers as Answers;

      const slugifyTitle = slugify(answers.title);
      const data: Data = {
        ...rest,
        authorDetail: getAuthor(answers.author),
        categoryList: answers.categories.trim().split(" "),
        keywordList: answers.keywords.trim().split(" "),
        slugifyTitle,
      };

      data.postId = nextId(data.authorDetail.id);

      return [
        {
          type: "addMany",
          destination: `${root}/content/{{postType}}/{{slugifyTitle}}/`,
          templateFiles: "./plop-templates/index.mdx.hbs",
          data,
          skipIfExists: true,
        },
        () => "Blog generate ready!",
      ];
    },
  });
};

const slugify = (str = "") => {
  let slug = str
    .toLowerCase()
    .replace(/\s/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");

  // If the value starts with a number, swap it out!
  // Doing this in a dumb way for now.
  if (slug.match(/^[\d]{1,2}/)) {
    slug = slug.replace(/^[\d]{1,2}/, "digit");
  }

  return slug;
};
