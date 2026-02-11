export default function CoreSite() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">
          Core Site
        </h1>
        <div className="space-y-6 text-foreground/80">
          <p className="text-lg md:text-xl">
            The Core Site is the central hub for all Prime Editz services and
            resources. Here you'll find access to our main platform, tools, and
            services.
          </p>
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Platform Features
            </h2>
            <ul className="space-y-3 text-lg md:text-xl list-disc list-inside">
              <li>Project management dashboard</li>
              <li>File upload and delivery system</li>
              <li>Real-time collaboration tools</li>
              <li>Progress tracking and updates</li>
              <li>Secure client portal</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Access Your Projects
            </h2>
            <p className="text-lg md:text-xl">
              Log in to access your projects, view progress, provide feedback,
              and download your completed videos. Our platform makes it easy to
              collaborate with our team and manage your video editing projects
              efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
