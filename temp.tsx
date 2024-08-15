import { marked } from "marked";
import { useState, useEffect } from "react";

function App() {
  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    const markdownFile = `# Hello World\n## Deneme\n### Deneme 2\n`;
    const updateMarkdown = async () => {
      const markedResult = await marked(markdownFile);
      setMarkdown(markedResult);
    };
    updateMarkdown();
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen justify-start p-10">
      <div></div>
      <div
        className="markdown"
        dangerouslySetInnerHTML={{
          __html: markdown,
        }}
      />
      <hr />
      <div
        className="markdown"
        dangerouslySetInnerHTML={{ __html: markdown }}
      />
    </div>
  );
}

export default App;
