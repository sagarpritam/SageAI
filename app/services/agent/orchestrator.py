"""AI Agent Orchestrator Pipeline."""

import json
import logging
import asyncio
from typing import Dict, Any, List

from app.services.llm.gateway import llm_gateway
from app.services.tools import get_all_tools, get_tool
from .prompts import PLANNER_PROMPT, ANALYZER_PROMPT, REPORTER_PROMPT

logger = logging.getLogger("SageAI.agent")

class AgentOrchestrator:
    """
    Executes the 4-stage AI pipeline:
    1. Planner -> selects tools
    2. Executor -> runs tools
    3. Analyzer -> consolidates findings
    4. Reporter -> generates summary
    """
    
    def __init__(self, org_id: str = "system"):
        self.org_id = org_id

    async def _planner_phase(self, user_prompt: str, target: str) -> List[str]:
        """Decide which tools to run based on user prompt."""
        tools = get_all_tools()
        tools_list = "\n".join([f"- {t.name}: {t.description}" for t in tools])
        
        prompt = PLANNER_PROMPT.replace("{tools_list}", tools_list)\
                              .replace("{user_prompt}", user_prompt)\
                              .replace("{target}", target)
                              
        response = await llm_gateway.generate(
            prompt, 
            system_message="You are the Planner Agent. Output ONLY a valid JSON list of strings.",
            org_id=self.org_id
        )
        
        try:
            # Clean possible markdown wrap
            cleaned = response.replace("```json", "").replace("```", "").strip()
            selected_tools = json.loads(cleaned)
            if not isinstance(selected_tools, list):
                selected_tools = [t.name for t in tools] # Fallback
            return selected_tools
        except json.JSONDecodeError:
            logger.error(f"Failed to parse planner output: {response}")
            return [t.name for t in tools] # Fallback to all tools

    async def _executor_phase(self, target: str, selected_tools: List[str]) -> Dict[str, Any]:
        """Execute selected tools concurrently."""
        results = {}
        tasks = []
        valid_tools = []
        
        for name in selected_tools:
            tool = get_tool(name)
            if tool:
                valid_tools.append(tool)
                
        if not valid_tools:
            return {"error": "No valid tools selected"}
            
        # Run all selected tools concurrently
        coros = [tool.run(target) for tool in valid_tools]
        raw_results = await asyncio.gather(*coros, return_exceptions=True)
        
        for tool, result in zip(valid_tools, raw_results):
            if isinstance(result, Exception):
                results[tool.name] = {"error": str(result)}
            else:
                results[tool.name] = result
                
        return results

    async def _analyzer_phase(self, tool_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze raw tool output and consolidate vulnerabilities."""
        prompt = ANALYZER_PROMPT.replace("{tool_results}", json.dumps(tool_results, indent=2))
        
        response = await llm_gateway.generate(
            prompt,
            system_message="You are the Analyzer Agent. Output ONLY a valid JSON array of vulnerability objects.",
            org_id=self.org_id
        )
        
        try:
            cleaned = response.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse analyzer output: {response}")
            return [{"type": "Analysis Error", "description": "Failed to parse AI analysis", "severity": "Info"}]

    async def _reporter_phase(self, vulnerabilities: List[Dict[str, Any]]) -> str:
        """Generate executive summary report."""
        prompt = REPORTER_PROMPT.replace("{vulnerabilities}", json.dumps(vulnerabilities, indent=2))
        
        response = await llm_gateway.generate(
            prompt,
            system_message="You are the Reporter Agent. Output a professional markdown report.",
            org_id=self.org_id
        )
        return response

    async def execute_task(self, user_prompt: str, target: str) -> Dict[str, Any]:
        """Run the full agentic workflow."""
        
        logger.info(f"Starting Agent workflow for target: {target}")
        
        # 1. Plan
        selected_tools = await self._planner_phase(user_prompt, target)
        logger.info(f"Planner selected tools: {selected_tools}")
        
        # 2. Execute
        tool_results = await self._executor_phase(target, selected_tools)
        logger.info("Executor finished running tools")
        
        # 3. Analyze
        vulnerabilities = await self._analyzer_phase(tool_results)
        logger.info(f"Analyzer found {len(vulnerabilities)} vulnerabilities")
        
        # 4. Report
        report = await self._reporter_phase(vulnerabilities)
        logger.info("Reporter generated executive summary")
        
        return {
            "target": target,
            "prompt": user_prompt,
            "selected_tools": selected_tools,
            "raw_results": tool_results,
            "vulnerabilities": vulnerabilities,
            "executive_summary": report
        }
