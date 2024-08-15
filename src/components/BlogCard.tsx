import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BlogCard = ({
  title,
  description,
  date,
  id,
}: {
  title: string;
  description: string;
  date: string;
  id: string;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <a href={`/#/blogpost/${id}`}>{title}</a>
          <div className="text-sm">{date}</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
