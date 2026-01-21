export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Contact Us</h1>
        <div className="space-y-8 text-foreground/80">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Get in Touch</h2>
            <p className="text-lg md:text-xl">
              Have a project in mind? We'd love to hear from you. Reach out to discuss your 
              video editing needs and how we can help bring your vision to life.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Contact Information</h2>
            <div className="space-y-2 text-lg md:text-xl">
              <p><strong>Phone:</strong> +91 636432 5166</p>
              <p><strong>Email:</strong> info@primeeditz.com</p>
              <p><strong>Working Hours:</strong> Mon-Sat, 9:00 AM - 7:00 PM</p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Let's Work Together</h2>
            <p className="text-lg md:text-xl">
              Whether you're a content creator, business owner, or creative professional, 
              we're ready to help you create stunning video content that makes an impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

