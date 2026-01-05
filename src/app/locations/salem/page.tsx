import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving & Sealcoating in Salem, IL',
  description: 'Professional asphalt paving, sealcoating, and pavement maintenance in Salem, IL. Serving Marion County with quality workmanship. Free estimates! Call 618-214-7656.',
};

export default function SalemPage() {
  return (
    <LocationPageLayout
      cityName="Salem"
      county="Marion County"
      distance="25 miles"
      description="Professional asphalt paving and sealcoating services for Salem homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Asphalt Services in Salem, Illinois</h2>
      <p>Pinpoint Parking is proud to serve Salem and all of Marion County with professional asphalt paving and maintenance services. As the county seat of Marion County, Salem deserves quality pavement solutions that stand up to Southern Illinois weather conditions.</p>

      <p>Whether you need a new driveway for your Salem home, parking lot maintenance for your business on Broadway, or repairs for commercial properties near Salem Memorial District Hospital, our team delivers reliable results.</p>

      <h2>Why Salem Chooses Pinpoint Parking</h2>
      <p>Salem property owners trust us because we understand local conditions. From the freeze-thaw cycles that damage pavement to the hot summers that can soften asphalt, we use materials and techniques suited for Marion County&apos;s climate.</p>
    </LocationPageLayout>
  );
}
