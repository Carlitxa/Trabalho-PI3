const sequelize = require('./db');
const Proposal = require('./models/Proposal');

(async () => {
  try {
    await sequelize.authenticate();
    const [updated] = await Proposal.update(
      { status: 'disponivel' },
      { where: { status: 'validada' } }
    );
    console.log(`Propostas corrigidas: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error('Erro ao corrigir propostas:', err);
    process.exit(1);
  }
})();
