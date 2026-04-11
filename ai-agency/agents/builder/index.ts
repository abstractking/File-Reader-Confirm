// agents/builder/index.ts — STUB
import { Task, AgentRunResult } from "../../core/types";
export async function run(task: Task): Promise<AgentRunResult> {
  return { summary: "BUILDER stub", data: { status: "stub", task_type: task.task_type } };
}
