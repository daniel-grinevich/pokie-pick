import Image from "next/image";
import { mock } from "node:test";

const mockData = 
[
  {
    id:1,
    title: "Travel Title",
    description: "a little helper text for the article"
  },
  {
    id:2,
    title: "Travel Title 2",
    description: "a little helper text for the article 2"
  },
  {
    id:3,
    title: "Travel Title 3",
    description: "a little helper text for the article 3"
  },
]

export default function Home() {
  return (
    <div className="">
       {mockData.map((data) => (
        <h1>hi</h1>
       ))};
    </div>
  );
}
