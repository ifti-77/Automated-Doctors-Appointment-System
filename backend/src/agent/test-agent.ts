// // backend/src/agent/test-agent.ts
// import { receptionistAgent } from "./receptionist.agent";

// async function runTest() {
//   console.log("🚀 Initializing Agent Test...");
  
//   try {
//     const result = await receptionistAgent.invoke({
//       messages: [
//         { 
//           role: "user", 
//           content: "Hi, I'm John Doe. Can I see Dr. Smith this coming Saturday at 11:00 AM? If it's free, book it." 
//         }
//       ],
//     });

//     console.log("\n--- AI Agent Reasoning Trace ---");
//     // Print every message exchange to see the tool outputs
//     result.messages.forEach((msg: any) => {
//       console.log(`[${msg.role || msg._getType()}]: ${msg.content || JSON.stringify(msg.tool_calls)}`);
//     });

//   } catch (error) {
//     console.error("❌ Agent execution crashed:", error);
//   }
// }

// runTest();