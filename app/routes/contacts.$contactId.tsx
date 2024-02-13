import type { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { json } from "@remix-run/node";
import {
  Form,
  // Outlet, // just to test something
  Link,
  useLoaderData,
} from "@remix-run/react";
import type { FunctionComponent } from "react";

import type { ContactRecord } from "../data";

import { getContact } from "../data";

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

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
  const favorite = contact.favorite;

  return (
    <Form method="post">
      <button
        // added for dark mode background
        className="favorite"
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </Form>
  );
};
