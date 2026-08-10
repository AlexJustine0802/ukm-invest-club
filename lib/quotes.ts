/**
 * The line under the dashboard greeting.
 *
 * One quote per day, picked by the date rather than at random: everyone opening
 * the dashboard on the same day reads the same line, and a refresh does not
 * reshuffle it.
 */
export type Quote = { text: string; author: string };

export const QUOTES: Quote[] = [
  {
    text: "The best investment you can make is in yourself.",
    author: "Warren Buffett",
  },
  {
    text: "Risk comes from not knowing what you are doing.",
    author: "Warren Buffett",
  },
  {
    text: "In investing, what is comfortable is rarely profitable.",
    author: "Robert Arnott",
  },
  {
    text: "The stock market is a device for transferring money from the impatient to the patient.",
    author: "Warren Buffett",
  },
  {
    text: "Know what you own, and know why you own it.",
    author: "Peter Lynch",
  },
  {
    text: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
  {
    text: "The individual investor should act consistently as an investor and not as a speculator.",
    author: "Benjamin Graham",
  },
  {
    text: "Do not save what is left after spending; spend what is left after saving.",
    author: "Warren Buffett",
  },
  {
    text: "Time in the market beats timing the market.",
    author: "Ken Fisher",
  },
  {
    text: "The four most dangerous words in investing are: this time it's different.",
    author: "Sir John Templeton",
  },
  {
    text: "Wide diversification is only required when investors do not understand what they are doing.",
    author: "Warren Buffett",
  },
  {
    text: "Price is what you pay. Value is what you get.",
    author: "Warren Buffett",
  },
  {
    text: "Compound interest is the eighth wonder of the world.",
    author: "Attributed to Albert Einstein",
  },
  {
    text: "The big money is not in the buying and the selling, but in the waiting.",
    author: "Charlie Munger",
  },
];

/**
 * Days since the epoch, from the local date parts.
 *
 * Not `getTime() / 86400000`: that counts UTC days, so the quote would change
 * mid-afternoon in Jakarta rather than at midnight.
 */
function dayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
}

export function quoteOfTheDay(date: Date = new Date()): Quote {
  return QUOTES[((dayNumber(date) % QUOTES.length) + QUOTES.length) % QUOTES.length];
}
