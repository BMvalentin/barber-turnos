"use client";
// src/components/test-mp/TarjetasPrueba.tsx

export function TarjetasPrueba() {
  return (
    <section className="border border-zinc-800 rounded-xl overflow-hidden">
      <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-800">
        <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
          Tarjetas de prueba (sandbox)
        </span>
      </div>
      <div className="p-4 grid grid-cols-1 gap-3 text-xs">
        {[
          {
            label: "✓ Aprobada",
            numero: "4509 9535 6623 3704",
            vto: "11/25",
            cvv: "123",
            nombre: "APRO",
            color: "border-emerald-500/20 text-emerald-400",
          },
          {
            label: "✗ Rechazada",
            numero: "3743 781877 55283",
            vto: "11/25",
            cvv: "1234",
            nombre: "OTHE",
            color: "border-red-500/20 text-red-400",
          },
          {
            label: "⏳ Pendiente",
            numero: "4075 5957 1648 3764",
            vto: "11/25",
            cvv: "123",
            nombre: "CONT",
            color: "border-yellow-500/20 text-yellow-400",
          },
        ].map((card) => (
          <div
            key={card.numero}
            className={`border rounded-lg p-3 ${card.color} bg-zinc-900/30`}
          >
            <p className="font-bold mb-2">{card.label}</p>
            <div className="grid grid-cols-3 gap-2 text-zinc-400">
              <div>
                <span className="text-zinc-600 block">Número</span>
                <span className="font-mono text-zinc-300">{card.numero}</span>
              </div>
              <div>
                <span className="text-zinc-600 block">Vto / CVV</span>
                <span className="font-mono text-zinc-300">
                  {card.vto} / {card.cvv}
                </span>
              </div>
              <div>
                <span className="text-zinc-600 block">Titular</span>
                <span className="font-mono text-zinc-300">{card.nombre}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}