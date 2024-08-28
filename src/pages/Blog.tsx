import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BiUpArrowCircle } from "react-icons/bi";
import { useParams } from "react-router-dom";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; // Optional: Include a highlight.js theme

// Configure marked with highlight.js for syntax highlighting
const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-", // Ensure the right class is applied for highlighting
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

const Blog = () => {
  const { id } = useParams<{ id: string }>();
  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    const getMarkdown = async () => {
      const response = await fetch(`/blog/content/${id}.md`);
      const data: string = await response.text();
      const markedResult = await marked.parse(data, {
        gfm: true,
      });
      setMarkdown(markedResult);
    };
    getMarkdown();
  }, [id]);

  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300); // Adjust scroll position threshold as needed
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="markdown md:w-4/6 w-full ">
      <div className="" dangerouslySetInnerHTML={{ __html: markdown }} />
      {showScrollButton && (
        <Button
          variant="ghost"
          className="fixed right-12 bottom-36 pt-10 hover:bg-transparent"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <BiUpArrowCircle className="mr-2 text-3xl hover:text-4xl hover:transition-all" />
        </Button>
      )}
    </div>
  );
};

export default Blog;
