import { authors } from "../../mdx/authors";

/** Return author info, */
export function getAuthor(author: string) {
  const person = authors[author as keyof typeof authors];
  if (!person) {
    console.warn("Invalid author. Did you add it to authors.json??");
    return authors.poro;
  }

  return person;
}
