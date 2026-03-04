import NotFound from "~/components/notFound";
import PageTitle from "~/components/pageTitle";
import { PageSection, PageWrapper } from "~/components/pageWrapper";

export default function Transfers() {
  return (
    <PageWrapper>
      <PageSection index={0}>
        <div className="flex justify-between">
          <PageTitle
            title="Transfers"
            subtitle="Manage and track transfers within the group"
          />
        </div>
      </PageSection>
      <div className="mt-6">
        <PageSection index={1}>
          <NotFound message="This feature is currently unavailable" />
        </PageSection>
      </div>
    </PageWrapper>
  );
}
