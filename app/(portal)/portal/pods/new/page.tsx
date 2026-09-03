import { PortalPageHeader } from "@/components/portal/primitives";
import { LaunchForm } from "@/components/portal/launch-form";
import { getClient } from "@/lib/api/client";

export const metadata = { title: "Launch pod" };

export default async function NewPodPage() {
  const cv = getClient();
  const [skus, profiles, projects] = await Promise.all([
    cv.listGpuSkus(),
    cv.listSliceProfiles(),
    cv.listProjects(),
  ]);

  return (
    <>
      <PortalPageHeader
        title="launch pod"
        description="Pick a GPU and a slice profile. The estimate updates as you go, and billing starts only when the pod reaches running."
      />
      <LaunchForm skus={skus} profiles={profiles} projects={projects} />
    </>
  );
}
