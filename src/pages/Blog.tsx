import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { marked } from "marked";

const Blog = () => {
  const { id } = useParams<{ id: string }>();
  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    const getMarkdown = async () => {
      const response = await fetch(`/content/${id}.md`);
      const data: string = await response.text();
      const markedResult = await marked(data);
      setMarkdown(markedResult);
    };
    getMarkdown();
  }, [id]);

  return (
    <div
      className="markdown container w-full px-0"
      dangerouslySetInnerHTML={{ __html: markdown }}
    />
  );
};

export default Blog;
