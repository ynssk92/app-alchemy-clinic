import { Card } from "@/components/ui/card";

const Stub = ({ title, description }: { title: string; description: string }) => (
  <div className="space-y-4">
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
    <Card className="p-10 text-center text-muted-foreground border-dashed">
      Coming soon — this section is scaffolded and ready to be built out.
    </Card>
  </div>
);


export const AdminDeleteRequests = () => <Stub title="Delete Account Requests" description="Review and process user account deletion requests." />;

export const AdminLocation = () => <Stub title="Location" description="Manage clinic locations and map settings." />;
export const AdminTestimonials = () => <Stub title="Testimonials" description="Manage patient testimonials shown on the website." />;
