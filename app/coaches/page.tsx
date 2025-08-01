import Link from "next/link"

export default function CoachesPage() {
  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <header className="cave-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Meet Our Coaches</h1>
          <p className="text-xl">
            Learn from experienced trainers who bring passion, skill, and dedication to every class.
          </p>
        </div>
      </header>

      {/* Coaches Grid */}
      <section className="card-grid">
        {[
          {
            name: "Kyle McLaughlin",
            role: "Head Boxing Coach",
            img: "/images/kyle-mclaughlin.png",
            bio: "Former national champion with over 15 years of coaching experience.",
            link: "/coach-kyle",
          },
          {
            name: "Humza Muhammad",
            role: "Strength & Conditioning Coach",
            img: "/images/coach-humza.png",
            bio: "Certified trainer specialising in power development and conditioning.",
            link: "/coach-humza",
          },
          {
            name: "Scott McDonald",
            role: "Boxing & Fitness Coach",
            img: "/images/coach-scott.png",
            bio: "Professional fighter focused on technique and cardio training.",
            link: "/coach-scott",
          },
        ].map((coach) => (
          <Link key={coach.name} href={coach.link} className="card">
            <img src={coach.img} alt={coach.name} />
            <div className="card-info">
              <h4>{coach.name}</h4>
              <p className="text-sm text-gray-600">{coach.role}</p>
            </div>
            <div className="card-overlay">
              <p>{coach.bio}</p>
            </div>
          </Link>
        ))}
      </section>

    </div>
  )
}
