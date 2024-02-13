/* Search
OK, this is normally going to need a whole lot of cleaning and refactoring but I fixed search the way that I wanted. Before, every time we would search it would include navigation to the homepage, removing the inserted contact page, which to me was a bummer. Why shouldn't be able to see a contact while I'm searching for another. This is where I believe useState makes more sense than searchParams because, using search to filter here should not need more database calls on a list that has already been downloaded. And then, we have the added benefits of staying on the contacts.$contactId.tsx route. 
*/

import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  // Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useState } from "react";

import { createEmptyContact, getContacts } from "./data";

import appStylesHref from "./app.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

// Loader is a convention. Application breaks if you change it.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Actually, here I would have filtered with a useState so that
  // it doesn't remove the outlet while we're searching.
  // Even if it's filtered through calls, here it would be best if
  // the list was obtained via state so that the contact URL would
  // remain the same.
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

// I'll assume that action is a convention as well
export const action = async () => {
  const contact = await createEmptyContact();
  // return json({ contact });
  return redirect(`/contacts/${contact.id}/edit`);
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  // console.log(navigation.state); // goes loading-loading-idle
  // const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");
  // console.log(navigation.location); // gets four times the same object then gets two undefined
  // console.log(searching); // gets four times true then gets two undefined

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  const [query, setQuery] = useState("");
  console.log(query);

  let filteredContacts = [];
  if (query !== "") {
    filteredContacts = contacts.filter(
      (contact) =>
        contact
          .first!.toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()) ||
        contact.last!.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    );
  } else {
    filteredContacts = contacts;
  }

  console.log(filteredContacts);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            {/* <Form */}
            <form
              id="search-form"
              // onChange={(event) =>
              //   submit(event.currentTarget)}
              // onChange={(event) => {
              //   // console.log(event.currentTarget);
              //   const isFirstSearch = q === null;
              //   // const isFirstSearch = !!q === false;
              //   // console.log(isFirstSearch); // So far q becomes an empty string and therefore continues to remain true. Unlike in the Next.js tutorial where they make sure to remove the query param when it becomes an empty string.
              //   // So here I could get this to be true when "" with a DOUBLE NOT. Exactly.
              //   // But since it's to remove the searchParams, theirs is better.
              //   submit(event.currentTarget, {
              //     replace: !isFirstSearch,
              //   });
              // }}
              role="search"
            >
              <input
                id="q"
                aria-label="Search contacts"
                className={searching ? "loading" : ""}
                // defaultValue={q || ""}
                // value={q || ""}
                value={query || ""}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
              {/* </Form> */}
            </form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {/* <ul>
              <li>
                <Link to={`/contacts/1`}>Your Name</Link>
              </li>
              <li>
                <Link to={`/contacts/2`}>Your Friend</Link>
              </li>
            </ul> */}
            {/* {contacts.length ? ( */}
            {filteredContacts.length ? (
              <ul>
                {/* {contacts.map((contact) => ( */}
                {filteredContacts.map((contact) => (
                  <li key={contact.id}>
                    {/* ...And by relative value they mean to say contacts/${contact.id}` is relative to the currenth path with is /. */}
                    {/* <Link to={`contacts/${contact.id}`}> */}
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? <span>★</span> : null}
                      {/* </Link> */}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          className={
            navigation.state === "loading" && !searching ? "loading" : ""
          }
          id="detail"
        >
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
