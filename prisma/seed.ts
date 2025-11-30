import { PaymentMethod, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário de teste
  const hashedPassword = await bcrypt.hash('Fenix0809??', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Diego',
      email: 'fenix.drs@gmail.com',
      password: hashedPassword,
    },
  });
  console.log('✅ Usuário criado:', user.email);

  // Criar contas
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        name: 'Nu Bank',
        userId: user.id,
      },
    }),
    prisma.account.create({
      data: {
        name: 'Itaú',
        userId: user.id,
      },
    }),
    prisma.account.create({
      data: {
        name: 'Inter',
        userId: user.id,
      },
    }),
  ]);
  console.log('✅ Contas criadas:', accounts.length);

  // Criar categorias
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Casa',
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Trabalho',
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Saúde',
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Lazer',
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Relacionamento',
        userId: user.id,
      },
    }),
  ]);
  console.log('✅ Categorias criadas:', categories.length);

  // Criar subcategorias
  const subcategories = await Promise.all([
    // Alimentação
    prisma.subcategory.create({
      data: {
        name: 'Alimentação',
        userId: user.id,
      },
    }),
    prisma.subcategory.create({
      data: {
        name: 'Refeição',
        userId: user.id,
      },
    }),
    prisma.subcategory.create({
      data: {
        name: 'Internet',
        userId: user.id,
      },
    }),
    // Transporte
    prisma.subcategory.create({
      data: {
        name: 'Água',
        userId: user.id,
      },
    }),
    prisma.subcategory.create({
      data: {
        name: 'Uber/Taxi',
        userId: user.id,
      },
    }),
    prisma.subcategory.create({
      data: {
        name: 'Transporte Público',
        userId: user.id,
      },
    }),
    // Saúde
    prisma.subcategory.create({
      data: {
        name: 'Farmácia',
        userId: user.id,
      },
    }),
    prisma.subcategory.create({
      data: {
        name: 'Consulta Médica',
        userId: user.id,
      },
    }),
    // Lazer
    prisma.subcategory.create({
      data: {
        name: 'Cinema',
        userId: user.id,
      },
    }),
    prisma.subcategory.create({
      data: {
        name: 'Streaming',
        userId: user.id,
      },
    }),
    // Casa
    prisma.subcategory.create({
      data: {
        name: 'Aluguel',
        userId: user.id,
      },
    }),
    prisma.subcategory.create({
      data: {
        name: 'Luz',
        userId: user.id,
      },
    }),
  ]);
  console.log('✅ Subcategorias criadas:', subcategories.length);

  // Criar tipos de transação
  const transactionTypes = await Promise.all([
    prisma.transactionType.create({
      data: {
        name: 'Débito',
        userId: user.id,
      },
    }),
    prisma.transactionType.create({
      data: {
        name: 'Crédito',
        userId: user.id,
      },
    }),
    prisma.transactionType.create({
      data: {
        name: 'PIX',
        userId: user.id,
      },
    }),
    prisma.transactionType.create({
      data: {
        name: 'Dinheiro',
        userId: user.id,
      },
    }),
    prisma.transactionType.create({
      data: {
        name: 'Transferência',
        userId: user.id,
      },
    }),
    prisma.transactionType.create({
      data: {
        name: 'Vale Alimentação',
        userId: user.id,
      },
    }),
    prisma.transactionType.create({
      data: {
        name: 'Vale Refeição',
        userId: user.id,
      },
    }),
  ]);
  console.log('✅ Tipos de transação criados:', transactionTypes.length);

  // Criar algumas transações de exemplo
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        storeName: 'Supermercado ABC',
        storeAddress: 'Rua das Flores, 123',
        dateTicket: '2024-01-17 00:00:00.000',
        timeTicket: '10:30:00',
        paymentMethod: PaymentMethod.DEBIT_CARD,
        cnpj: '12.345.678/0001-90',
        urlNfe: 'https://nfe.fazenda.gov.br/nota/123',
        userId: user.id,
        accountId: accounts[0].id, // Conta Corrente
        categoryId: categories[0].id, // Alimentação
        subcategoryId: subcategories[0].id, // Supermercado
        transactionTypeId: transactionTypes[0].id, // Débito
      },
    }),
    prisma.transaction.create({
      data: {
        storeName: 'Posto Shell',
        storeAddress: 'Av. Principal, 456',
        dateTicket: '2024-01-17 00:00:00.000',
        timeTicket: '14:15:00',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        cnpj: '98.765.432/0001-10',
        urlNfe: 'https://nfe.fazenda.gov.br/nota/456',
        userId: user.id,
        accountId: accounts[1].id, // Cartão de Crédito
        categoryId: categories[1].id, // Transporte
        subcategoryId: subcategories[3].id, // Combustível
        transactionTypeId: transactionTypes[1].id, // Crédito
      },
    }),
    prisma.transaction.create({
      data: {
        storeName: 'Farmácia Popular',
        storeAddress: 'Centro, 789',
        dateTicket: '2024-01-17 00:00:00.000',
        timeTicket: '17:32:16',
        paymentMethod: PaymentMethod.PIX,
        cnpj: '11.222.333/0001-44',
        urlNfe: 'https://nfe.fazenda.gov.br/nota/789',
        userId: user.id,
        accountId: accounts[0].id, // Conta Corrente
        categoryId: categories[2].id, // Saúde
        subcategoryId: subcategories[6].id, // Farmácia
        transactionTypeId: transactionTypes[2].id, // PIX
      },
    }),
  ]);
  console.log('✅ Transações criadas:', transactions.length);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('📧 Email de login: teste@fintrack.com');
  console.log('🔑 Senha: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
