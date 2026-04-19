// import postgres from 'postgres';

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// async function listInvoices() {
// 	const data = await sql`
//     SELECT invoices.amount, customers.name
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id
//     WHERE invoices.amount = 666;
//   `;

// 	return data;
// }

// export async function GET() {
//   return Response.json({
//     message:
//       'Uncomment this file and remove this line. You can delete this file when you are finished.',
//   });
//   // try {
//   // 	return Response.json(await listInvoices());
//   // } catch (error) {
//   // 	return Response.json({ error }, { status: 500 });
//   // }
// }

import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

async function listInvoices() {
  await client.connect();
  const db = client.db(); // Uses the database name from your URI

  const data = await db.collection('invoices').aggregate([
    {
      // 1. Find invoices with amount 666
      $match: { amount: 666 } 
    },
    {
      // 2. Join (Lookup) the customers collection
      $lookup: {
        from: 'customers',
        localField: 'customer_id', // The ID in your Invoices collection
        foreignField: 'id',        // The ID in your Customers collection
        as: 'customer_details'
      }
    },
    {
      // 3. Clean up the output to match the original SQL structure
      $project: {
        amount: 1,
        name: { $arrayElemAt: ['$customer_details.name', 0] },
        _id: 0
      }
    }
  ]).toArray();

  return data;
}