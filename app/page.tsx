import { readFileSync } from "fs";
import { join } from "path";
import HomepageContent from "@/components/HomepageContent";

export default function Home() {
  const bodyHtml = readFileSync(
    join(process.cwd(), "app", "homepage-body.html"),
    "utf-8"
  );
  return <HomepageContent bodyHtml={bodyHtml} />;
}
