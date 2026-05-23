import { Nav } from './components/Nav';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';
import { Experience } from './components/sections/Experience';
import { Writing } from './components/sections/Writing';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';

export default function App() {
  return (
    <div className="bg-paper min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Projects />
        <Experience />
        <Writing />
        <About />
        <Contact />
      </main>
    </div>
  );
}
