// Plop script for templating out a converged mdx post
import { NodePlopAPI } from "plop";

import { authors } from "./authors";
import { getAuthor } from "./getAuthor";
import { findGitRoot } from "./scripts/monorepo";
import { slugify } from "./scripts/slugify";
import { nextId } from "./scripts/uuid";

import { Author } from "@global";

const root = findGitRoot();

interface Answers {
  postType: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string;
}

interface Data {
  postId?: string;
  title: string;
  description: string;
  date: string;
  authorDetail: Author;
  tagList: string[];
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

function getAuthorNicknameList() {
  return Object.keys(authors);
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
        type: "list",
        name: "author",
        message: "Author (ex: tienlx97)",
        choices: getAuthorNicknameList,
        validate: (author: string) =>
          getAuthorNicknameList().includes(author) || "Must enter author",
      },
      {
        type: "input",
        name: "tags",
        message: "tag",
        default: "react",
        validate: (input: string) => !!input || "Must enter a tag",
      },
    ],

    actions: (answers) => {
      const { tags: categories, author, ...rest } = answers as Answers;

      const slugifyTitle = slugify(rest.title);
      const data: Data = {
        ...rest,
        authorDetail: getAuthor(author),
        tagList: categories.trim().split(" "),
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
        () => "Post generate successfully!",
      ];
    },
  });
};
