// prisma/seed.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // ====================================
  // LIMPIAR DATOS EXISTENTES
  // ====================================
  console.log('🗑️  Limpiando datos existentes...');
  
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Datos antiguos eliminados');

  // ====================================
  // CREAR USUARIOS
  // ====================================
  console.log('👤 Creando usuarios...');

  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@examania.com',
      password: '123456', // En producción: hashear con bcrypt
      role: 'ADMIN',
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      name: 'Prof. María García',
      email: 'maria@examania.com',
      password: '123456',
      role: 'TEACHER',
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      name: 'Prof. Juan Pérez',
      email: 'juan@examania.com',
      password: '123456',
      role: 'TEACHER',
    },
  });

  console.log(`✅ Creados 3 usuarios`);

  // ====================================
  // CREAR PLANTILLAS
  // ====================================
  console.log('📋 Creando plantillas...');

  const template1 = await prisma.template.create({
    data: {
      name: 'Quiz Básico de Matemáticas',
      description: 'Plantilla para evaluaciones cortas de matemáticas',
      category: 'Quiz',
      isPublic: true,
      userId: teacherUser.id,
    },
  });

  const template2 = await prisma.template.create({
    data: {
      name: 'Examen de Historia',
      description: 'Plantilla para exámenes de historia con preguntas de desarrollo',
      category: 'Evaluación',
      isPublic: true,
      userId: teacherUser2.id,
    },
  });

  console.log(`✅ Creadas 2 plantillas`);

  // ====================================
  // CREAR EXÁMENES
  // ====================================
  console.log('📝 Creando exámenes...');

  const exam1 = await prisma.exam.create({
    data: {
      title: 'Examen de Álgebra - 1er Bimestre',
      description: 'Evaluación de ecuaciones lineales y cuadráticas',
      subject: 'Matemáticas',
      grade: '3ro Secundaria',
      duration: 60,
      totalPoints: 100,
      status: 'PUBLISHED',
      userId: teacherUser.id,
      templateId: template1.id,
    },
  });

  const exam2 = await prisma.exam.create({
    data: {
      title: 'Quiz de Geometría',
      description: 'Evaluación rápida sobre triángulos y áreas',
      subject: 'Matemáticas',
      grade: '2do Secundaria',
      duration: 30,
      totalPoints: 50,
      status: 'DRAFT',
      userId: teacherUser.id,
    },
  });

  const exam3 = await prisma.exam.create({
    data: {
      title: 'Examen de la Revolución Mexicana',
      description: 'Evaluación sobre causas y consecuencias',
      subject: 'Historia',
      grade: '3ro Secundaria',
      duration: 90,
      totalPoints: 100,
      status: 'PUBLISHED',
      userId: teacherUser2.id,
      templateId: template2.id,
    },
  });

  console.log(`✅ Creados 3 exámenes`);

  // ====================================
  // CREAR PREGUNTAS PARA EXAMEN 1
  // ====================================
  console.log('❓ Creando preguntas...');

  const question1 = await prisma.question.create({
    data: {
      content: '¿Cuál es el valor de x en la ecuación: 2x + 5 = 15?',
      type: 'MULTIPLE_CHOICE',
      points: 10,
      order: 1,
      examId: exam1.id,
      options: {
        create: [
          { content: 'x = 5', isCorrect: true, order: 1 },
          { content: 'x = 10', isCorrect: false, order: 2 },
          { content: 'x = 7', isCorrect: false, order: 3 },
          { content: 'x = 3', isCorrect: false, order: 4 },
        ],
      },
    },
  });

  const question2 = await prisma.question.create({
    data: {
      content: 'Una ecuación cuadrática siempre tiene dos soluciones reales.',
      type: 'TRUE_FALSE',
      points: 10,
      order: 2,
      examId: exam1.id,
      options: {
        create: [
          { content: 'Verdadero', isCorrect: false, order: 1 },
          { content: 'Falso', isCorrect: true, order: 2 },
        ],
      },
    },
  });

  const question3 = await prisma.question.create({
    data: {
      content: 'Resuelve la siguiente ecuación: x² - 4 = 0',
      type: 'SHORT_ANSWER',
      points: 15,
      order: 3,
      examId: exam1.id,
    },
  });

  // ====================================
  // CREAR PREGUNTAS PARA EXAMEN 2
  // ====================================

  await prisma.question.create({
    data: {
      content: '¿Cuál es la fórmula del área de un triángulo?',
      type: 'MULTIPLE_CHOICE',
      points: 10,
      order: 1,
      examId: exam2.id,
      options: {
        create: [
          { content: 'base × altura', isCorrect: false, order: 1 },
          { content: '(base × altura) / 2', isCorrect: true, order: 2 },
          { content: 'base + altura', isCorrect: false, order: 3 },
          { content: 'π × radio²', isCorrect: false, order: 4 },
        ],
      },
    },
  });

  // ====================================
  // CREAR PREGUNTAS PARA EXAMEN 3
  // ====================================

  await prisma.question.create({
    data: {
      content: 'Explica tres causas principales de la Revolución Mexicana.',
      type: 'ESSAY',
      points: 30,
      order: 1,
      examId: exam3.id,
    },
  });

  await prisma.question.create({
    data: {
      content: '¿En qué año comenzó la Revolución Mexicana?',
      type: 'MULTIPLE_CHOICE',
      points: 10,
      order: 2,
      examId: exam3.id,
      options: {
        create: [
          { content: '1910', isCorrect: true, order: 1 },
          { content: '1905', isCorrect: false, order: 2 },
          { content: '1920', isCorrect: false, order: 3 },
          { content: '1915', isCorrect: false, order: 4 },
        ],
      },
    },
  });

  console.log(`✅ Creadas preguntas para 3 exámenes`);

  // ====================================
  // RESUMEN FINAL
  // ====================================
  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('─────────────────────────────────');
  console.log('📊 Resumen de datos creados:');
  console.log(`   👥 Usuarios: 3`);
  console.log(`   📋 Plantillas: 2`);
  console.log(`   📝 Exámenes: 3`);
  console.log(`   ❓ Preguntas: 6`);
  console.log(`   ✅ Opciones: 12`);
  console.log('─────────────────────────────────');
  console.log('🔐 Credenciales de prueba:');
  console.log('   Admin: admin@examania.com / 123456');
  console.log('   María: maria@examania.com / 123456');
  console.log('   Juan: juan@examania.com / 123456');
  console.log('─────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });