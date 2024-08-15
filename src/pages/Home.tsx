import BlogCard from "@/components/BlogCard";
import { useState, useEffect } from "react";

// Define a type for the blog post
interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

const Home: React.FC = () => {
  // Use the BlogPost type for the blogPosts state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      const response = await fetch("/blog/blog.index.json");
      const data = await response.json();

      // Map the response data to the BlogPost type
      const blogPosts = data.map((post: BlogPost) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        date: post.date,
        tags: post.tags,
      }));

      setBlogPosts(blogPosts);
      setLoading(false);
    };

    fetchBlogPosts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div>Recent Blog Posts...</div>
      {blogPosts.map((post) => (
        <div key={post.id} className="blog-post">
          <BlogCard
            title={post.title}
            description={post.description}
            date={post.date}
            id={post.id}
          />
        </div>
      ))}
    </div>
  );
};

export default Home;
