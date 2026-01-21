export default function About() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">About Prime Editz</h1>
        <div className="space-y-6 text-foreground/80">
          <p className="text-lg md:text-xl">
            Prime Editz is a leading video editing company dedicated to delivering exceptional 
            post-production services. We specialize in creating high-quality video content that 
            captivates audiences and tells your story effectively.
          </p>
          <p className="text-lg md:text-xl">
            Our team of experienced editors works with cutting-edge technology and creative 
            expertise to transform your raw footage into polished, professional videos.
          </p>
          <p className="text-lg md:text-xl">
            Whether you need corporate videos, promotional content, social media clips, or 
            full-length productions, we're here to help bring your vision to life.
          </p>
        </div>
      </div>
    </div>
  );
}

