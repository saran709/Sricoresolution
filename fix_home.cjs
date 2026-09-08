const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const injection = `
      {/* SRICORE SOLVE Methodology */}
      <section className="py-24 bg-blue-900 text-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The SRICORE SOLVE™ Methodology</h2>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">Our proprietary framework for engineering robust technology solutions from problem discovery to continuous evolution.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[{ letter: 'S', word: 'STUDY', desc: "Understand the client's problem and operational context deeply." },
              { letter: 'O', word: 'ORGANIZE', desc: 'Analyse requirements, constraints, resources and objectives.' },
              { letter: 'L', word: 'LAUNCH', desc: 'Create a prototype or proof of concept to validate the approach.' },
              { letter: 'V', word: 'VALIDATE', desc: 'Test the proposed solution and develop the complete system.' },
              { letter: 'E', word: 'EVOLVE', desc: 'Deploy, maintain, optimize and continuously improve the solution.' }
            ].map((item, i) => (
              <div key={i} className="bg-blue-800 p-6 rounded-2xl border border-blue-700 text-center flex flex-col items-center">
                <div className="text-4xl font-black text-blue-300 mb-4">{item.letter}</div>
                <h3 className="text-xl font-bold mb-3">{item.word}</h3>
                <p className="text-sm text-blue-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
`;

code = code.replace('{/* Internships & Training Highlight */}', injection + '\n      {/* Internships & Training Highlight */}');
code = code.replace(/<Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">[\s\S]*?Contact Us Today[\s\S]*?<\/Button>/g, '<Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">TELL US YOUR PROBLEM</Button>');
code = code.replace(/to="\/contact"/g, 'to="/tell-us-your-problem"');
code = code.replace('Technology Services & Solutions', 'Technology Solutions Partner');

fs.writeFileSync('src/pages/Home.tsx', code);
