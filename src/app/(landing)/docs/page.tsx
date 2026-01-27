export default function Docs() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">
          Documentation
        </h1>
        <div className="space-y-6 text-foreground/80">
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Getting Started
            </h2>
            <p className="text-lg md:text-xl">
              Learn how to get started with Prime Editz services. Our
              comprehensive documentation covers everything from submitting your
              project to receiving the final deliverables.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Service Guidelines
            </h2>
            <p className="text-lg md:text-xl">
              Understand our service guidelines, including file formats,
              delivery timelines, revision policies, and best practices for
              submitting your content.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              API & Integration
            </h2>
            <p className="text-lg md:text-xl">
              Explore our API documentation for developers looking to integrate
              Prime Editz services into their applications and workflows.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
