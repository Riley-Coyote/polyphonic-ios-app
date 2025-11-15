# Reasoning Effort Controls for GPT-5.1 and GPT-5

This document explains how reasoning effort parameters work in Polyphonic for OpenAI's GPT-5.1 and GPT-5 models.

## Overview

OpenAI's GPT-5.1 and GPT-5 reasoning models support a `reasoning_effort` parameter that allows developers to control the balance between speed, cost, and intelligence.

## GPT-5.1 Reasoning Effort

### Available Values

| Value | Speed | Cost | Intelligence | Use Case |
|-------|-------|------|--------------|----------|
| `none` | ⚡️ Fastest | 💰 Lowest | 🧠 Standard | Latency-sensitive workloads, simple tasks |
| `low` | 🏃 Fast | 💰💰 Low | 🧠🧠 Good | Moderately complex tasks |
| `medium` | 🚶 Moderate | 💰💰💰 Medium | 🧠🧠🧠 Better | Complex reasoning tasks |
| `high` | 🐌 Slower | 💰💰💰💰 Highest | 🧠🧠🧠🧠 Best | Maximum intelligence, reliability over speed |

### Default Behavior

**GPT-5.1 defaults to `none`** - This is ideal for latency-sensitive workloads and represents a change from GPT-5.

> ⚠️ **Important**: When upgrading from GPT-5 to GPT-5.1, you may need to explicitly pass a reasoning_effort level if you want reasoning to occur, since the default changed from `medium` to `none`.

### When to Use Each Setting

#### `none` (Default)
```typescript
{
  model: 'gpt-5.1',
  reasoning_effort: 'none' // or omit for default
}
```
- **Best for**: Simple extraction, formatting, classification
- **Behavior**: Acts like a non-reasoning model
- **Speed**: Minimal latency, fastest time-to-first-token
- **Cost**: Minimal reasoning tokens (0 or very few)

#### `low`
```typescript
{
  model: 'gpt-5.1',
  reasoning_effort: 'low'
}
```
- **Best for**: Moderately complex tasks, basic problem-solving
- **Speed**: Still relatively fast
- **Cost**: Some reasoning tokens

#### `medium`
```typescript
{
  model: 'gpt-5.1',
  reasoning_effort: 'medium'
}
```
- **Best for**: Complex tasks requiring significant thought
- **Speed**: Noticeable thinking time
- **Cost**: Moderate reasoning tokens

#### `high`
```typescript
{
  model: 'gpt-5.1',
  reasoning_effort: 'high'
}
```
- **Best for**: Critical tasks where intelligence/reliability matters more than speed
- **Examples**: Complex analysis, multi-step planning, difficult problem-solving
- **Speed**: Longest processing time
- **Cost**: Highest reasoning token count

## GPT-5 Reasoning Effort (Non-5.1)

### Available Values

| Value | Speed | Intelligence | Use Case |
|-------|-------|--------------|----------|
| `minimal` | ⚡️ Fastest | 🧠 Basic | Latency optimization |
| `medium` | 🚶 Moderate | 🧠🧠🧠 Balanced | Standard reasoning (default) |

### Default Behavior

**GPT-5 defaults to `medium`** - This provides balanced reasoning for most tasks.

### When to Use Each Setting

#### `minimal`
```typescript
{
  model: 'gpt-5',
  reasoning_effort: 'minimal'
}
```
- **Best for**: Deterministic, lightweight tasks
- **Examples**:
  - Data extraction and formatting
  - Short rewrites
  - Simple classification
- **Avoid for**: Multi-step planning, tool-heavy workflows
- **Behavior**: Outputs very few or no reasoning tokens
- **Goal**: Minimize latency and speed time-to-first-token

#### `medium` (Default)
```typescript
{
  model: 'gpt-5',
  reasoning_effort: 'medium' // or omit for default
}
```
- **Best for**: Balanced reasoning across most tasks
- **Behavior**: Standard reasoning token generation

## Implementation in Polyphonic

### API Service Integration

The reasoning effort is automatically applied based on the model:

```typescript
// GPT-5.1 models - defaults to 'none'
if (model.id.startsWith('gpt-5.1')) {
  reasoning_effort: options?.reasoningEffort || 'none'
}

// GPT-5 models - defaults to 'medium'
if (model.id.startsWith('gpt-5') && !model.id.includes('5.1')) {
  reasoning_effort: options?.reasoningEffort || 'medium'
}
```

### Using Reasoning Effort in Your Code

```typescript
import { aiService } from './services/api/AIService';

// Example 1: Quick extraction (use 'none')
const quickResponse = await aiService.sendMessage(
  gpt51Model,
  messages,
  {
    reasoningEffort: 'none',
    temperature: 0.7
  }
);

// Example 2: Complex analysis (use 'high')
const thoughtfulResponse = await aiService.sendMessage(
  gpt51Model,
  messages,
  {
    reasoningEffort: 'high',
    temperature: 0.7
  }
);

// Example 3: GPT-5 with minimal reasoning
const gpt5Fast = await aiService.sendMessage(
  gpt5Model,
  messages,
  {
    reasoningEffort: 'minimal',
    temperature: 0.7
  }
);
```

## Performance & Cost Implications

### Speed

The higher the reasoning effort, the longer the model spends processing:

```
none < low < medium < high
  ⚡   🏃    🚶    🐌
```

GPT-5.1 varies its thinking time more dynamically than GPT-5. On easy tasks, GPT-5.1 is much faster than GPT-5 even at high reasoning effort.

### Cost

Reasoning tokens are billed separately from input/output tokens:

```
Reasoning Tokens: none < minimal < low < medium < high
     Cost:         $     $        $$   $$$     $$$$
```

Higher reasoning effort → More reasoning tokens → Higher cost

### Token Consumption

```typescript
// Typical reasoning token counts (approximate)
none:    0-5 tokens
minimal: 5-50 tokens
low:     50-200 tokens
medium:  200-1000 tokens
high:    1000+ tokens (can be significantly more)
```

## Best Practices

### 1. Choose Based on Task Complexity

```typescript
// Simple tasks → 'none' or 'minimal'
const simpleTask = {
  task: "Extract the email from this text",
  reasoningEffort: 'none'
};

// Complex tasks → 'medium' or 'high'
const complexTask = {
  task: "Analyze this codebase and suggest architectural improvements",
  reasoningEffort: 'high'
};
```

### 2. Optimize for Your Use Case

**Latency-Sensitive (e.g., chatbots)**
```typescript
reasoningEffort: 'none'  // GPT-5.1
reasoningEffort: 'minimal' // GPT-5
```

**Balanced Performance**
```typescript
reasoningEffort: 'low' or 'medium'
```

**Maximum Intelligence**
```typescript
reasoningEffort: 'high'
```

### 3. Consider Model Transition

When upgrading from GPT-5 to GPT-5.1:

```typescript
// Old (GPT-5)
{
  model: 'gpt-5',
  // reasoning_effort defaults to 'medium'
}

// New (GPT-5.1) - Need to explicitly set if you want reasoning!
{
  model: 'gpt-5.1',
  reasoning_effort: 'medium' // Explicitly set if you need reasoning
  // Default is 'none' in 5.1
}
```

## Model-Specific Recommendations

### GPT-5.1

| Model Variant | Recommended Effort | Reasoning |
|---------------|-------------------|-----------|
| GPT-5.1 | `none` to `medium` | Balanced for most tasks |
| GPT-5.1 Thinking | `low` to `high` | Built for extended reasoning |
| GPT-5.1 Mini | `none` to `low` | Efficiency-focused |
| GPT-5.1 Nano | `none` | Edge-optimized, minimal reasoning |

### GPT-5

| Model Variant | Recommended Effort | Reasoning |
|---------------|-------------------|-----------|
| GPT-5 | `minimal` to `medium` | Balanced |
| GPT-5 Thinking | `medium` | Designed for reasoning |
| GPT-5 Mini | `minimal` to `medium` | Efficiency-focused |
| GPT-5 Nano | `minimal` | Edge-optimized |

## Future UI Controls

Future versions will include UI controls to let users adjust reasoning effort:

- Global setting in Settings screen
- Per-conversation override
- Per-message override for specific queries
- Smart auto-detection based on task complexity

## References

- [OpenAI GPT-5.1 for Developers](https://openai.com/index/gpt-5-1-for-developers/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-5 New Params and Tools (Cookbook)](https://cookbook.openai.com/examples/gpt-5/gpt-5_new_params_and_tools)

## Version History

- **v1.0** (January 2025) - Initial implementation based on OpenAI GPT-5.1 release
  - Added `reasoning_effort` support for GPT-5.1 (`none`, `low`, `medium`, `high`)
  - Added `reasoning_effort` support for GPT-5 (`minimal`, `medium`)
  - Automatic defaults based on model version