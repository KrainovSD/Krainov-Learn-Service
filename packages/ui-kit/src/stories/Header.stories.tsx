import { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { Header } from "../components/Header/Header";

export default {
  title: "UX/Test",
  component: Header,
  //   argTypes: {
  //     borderColor: { defaultValue: "#7BCDFD" },
  //     children: {
  //       control: "text",
  //       defaultValue:
  //         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia dolor deserunt aspernatur fuga quisquam maxime dolore! Veniam consectetur alias facilis.",
  //     },
  //   },
} as Meta<typeof Header>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<typeof Header> = (args) => <Header />;

export const Default = Template.bind({});
