import { useEffect, useState } from "react";
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
      const markedResult = await marked.parse(data);
      setMarkdown(markedResult);
    };
    getMarkdown();
  }, [id]);

  return (
    <div
      className="markdown w-2/3 container"
      dangerouslySetInnerHTML={{ __html: markdown }}
    />
  );
};

export default Blog;
