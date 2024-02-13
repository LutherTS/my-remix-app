/* Folders
Routes can be put in folders without any routing issue as long as they're under the app/routes folder. It is therefore up to developers and organizations to define how they'll be organizing these routes among themselves.
It's better than Next.js's App Router in the sense that you have control, but worse in the same sense that a Remix developer will have to learn new, team specific conventions instead of being able to just and understand any Next.js App Router project just by its framework folder conventions.
*/

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { json } from "@remix-run/node";
import {
  Form,
  useFetcher,
  // Outlet, // just to test something
  // Link, // also to test something
  useLoaderData,
} from "@remix-run/react";
// import type { FunctionComponent } from "react";

import type { ContactRecord } from "../data";

import { getContact, updateContact } from "../data";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  // console.log(request);
  // console.log(formData);
  // console.log(formData.get("favorite"));
  return updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true", //  === "true" is to force a boolean so that it cannot be null
  });
};

// export const loader = async ({ params }) => {
export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Contact Not Found", {
      status: 404,
      statusText: "There is no contact with this ID in our fake database.",
    });
  }
  return json({ contact });
};

export default function Contact() {
  // const contact = {
  //   first: "Your",
  //   last: "Name",
  //   avatar: "https://placekitten.com/g/200/200",
  //   twitter: "your_handle",
  //   notes: "Some notes",
  //   favorite: true,
  // };
  const { contact } = useLoaderData<typeof loader>();

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          {/* Send to the path .../chocolat. 
          So by default, action in Remix sends to a route. */}
          {/* <Form action="chocolat">
            <button type="submit">Chocolat</button>
          </Form> */}

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>

          {/* Exactly. Without a / it links to .../destroying, 
          and with a slash it links to (root)/destroying. */}
          {/* <Link to={`destroying`}>Destroying</Link> */}
        </div>
      </div>
      {/* testing the default nested layout */}
      {/* Exactly. Without _ edit gets nested here. */}
      {/* <Outlet /> */}
    </div>
  );
}

// const Favorite: FunctionComponent<{
//   contact: Pick<ContactRecord, "favorite">;
// }> = ({ contact }) => {

function Favorite({ contact }: { contact: Pick<ContactRecord, "favorite"> }) {
  const fetcher = useFetcher();
  // const favorite = contact.favorite;
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite;

  return (
    // kinda like Framer Motion's motion.div, etc.
    <fetcher.Form method="post">
      <button
        // added for dark mode background
        className="favorite"
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}
