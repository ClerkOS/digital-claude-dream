import { useState } from "react";
import { createSession } from "../lib/api/v2/sessions";
import { runAnalysis } from "../lib/api/v2/analysis";
import type { Suggestion } from "../types/v2/analysis";
import { PipelineStep } from "@/components/DataPipelineProgress";

export function useUploadAndAnalyze() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [currentStep, setCurrentStep] = useState<PipelineStep>('creating');

    // Helper: minimum animation time per step
    const MIN_DURATION = 900;
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * Ensures each pipeline step:
     * 1. Sets the visual state
     * 2. Runs backend work (optional)
     * 3. Guarantees min duration for animations
     */
    async function advanceStep<T>(
        step: PipelineStep,
        work?: () => Promise<T>
    ): Promise<T | undefined> {
        setCurrentStep(step);

        const start = performance.now();

        let result: T | undefined = undefined;
        if (work) {
            result = await work();
        }

        const elapsed = performance.now() - start;
        if (elapsed < MIN_DURATION) {
            await wait(MIN_DURATION - elapsed);
        }

        return result;
    }

    /**
     * Upload + analysis pipeline with paced UI transitions
     */
    async function uploadAndAnalyze(file: File) {
        // Step 1: creating session
        const session = await advanceStep('creating', async () => {
            const res = await createSession(file);
            if (!res.ok) throw new Error('Failed to create session');
            console.log("Created session:", res.data.session_id);
            setSessionId(res.data.session_id);
            return res;
        });

        // Step 2: running analysis
        const analysis = await advanceStep('analyzing', async () => {
            console.log("Running analysis for session:", session.data.session_id);
            const res = await runAnalysis(session.data.session_id);
            if (!res.ok) throw new Error('Analysis failed');
            console.log("Analysis complete for session:", res);
            return res;
        });

        // Step 3: suggesting (results stage)
        await advanceStep('suggesting');

        if (!analysis) throw new Error('Analysis failed');

        setSuggestions(analysis.data.analysis.suggestions);

        return {
            sessionId: session!.data.session_id,
            suggestions: analysis.data.analysis.suggestions,
        };
    }

    return {
        sessionId,
        suggestions,
        currentStep,
        uploadAndAnalyze,
    };
}