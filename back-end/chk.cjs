const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
p.document.findMany({where:{type:'QM_DOC'},select:{id:true,participantId:true,measureId:true,responsible:true},take:3})
.then(r=>{console.log(JSON.stringify(r,null,2));return p.$disconnect();});
