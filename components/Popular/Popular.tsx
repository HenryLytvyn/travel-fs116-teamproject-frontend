import TravellersStories from '../TravellersStories/TravellersStories';

interface PopularProps {
  isAuthenticated: boolean;
}

export default function Popular({ isAuthenticated }: PopularProps) {
  return (
    <section className="">
      <div className="">
        <h2 className="">Популярні історії</h2>
        <TravellersStories isAuthenticated={isAuthenticated} />
      </div>
    </section>
  );
}