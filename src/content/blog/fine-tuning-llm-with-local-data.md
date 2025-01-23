---
title: 'Fine-tuning Meta Llama3-2-1b-Instruct model with Custom School District Dataset'
date: '2024-12-13'
author: 'Mary Precious Feutsop Ngouane'
tags: ['Data', 'Customization', 'Development', 'AI Tools']
image: '/images/blogs/fine-tuning-llm-with-local-data.png'
description: 'Process and steps necessary to allow a school or district to fine-tune their own llm with data that matters to them.'
---

_Mary Precious Feutsop Ngouane was a college extern from Carelton College that worked with the Peninsula School District in December of 2024 on fine tuning a large language model with our own internal datasets. This story is a description of how this process was done._

Fine-tuning large language models (LLMs) is like teaching an experienced professional new tricks specific to your field. In this technical guide, we will walk through the practical process of fine-tuning the Llama 3-2-1b-Instruct model using your own dataset – no PhD in machine learning required. Focusing on easy practical implementation steps and key technical considerations, you will be able to adapt a general-purpose model to your specific needs accessible locally on your computer.

Before we dive into implementation, let's gather the essential tools and resources for this project:

- Your Custom Dataset

This will be the foundation for teaching the model to understand and respond in ways that align with your requirements and use cases.

- Hugging Face Account🤗

You will need an account to access the [Llama3-2-1b-Instruc](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct)t model and host both your fine-tuned model and dataset. If you don't have one yet, take a moment to create an account at [Hugging Face](https://github.com/huggingface) 🤗. Before accessing the Llama model, you will need to request permission from the authors. This involves reading and accepting the terms of use, followed by submitting an access request. My request was approved 30 minutes after I submitted, but the approval time might vary.

- Google Colab Notebook

This cloud platform lets you run the training process without complex local setup. While the free version works perfectly fine for the fine-tuning process, you might want to consider the paid version with GPU access if you are working with larger datasets or need faster training times.

Now that we know what we need for this project, let’s get started\!

**Data Preparation**

Data preparation and formatting are very important for a successful fine-tuning process. Even with flawless code implementation, improperly formatted data will cause the model to terminate early in the process, often without clear error messages outputted. Let's start by ensuring your dataset meets the requirements for fine-tuning to avoid these silent failures.

The Llama3-2-1b-Instruct model requires a specific conversational format for fine-tuning, consisting of three essential components:

1. A system message that provides context/personna for the model
2. A user message containing the prompt
3. An assistant message containing the response

Each training entry must be structured as a dictionary with a 'messages' key. This key contains a list of dictionaries, where each dictionary has two elements:

- A 'role' key specifying either 'system', 'user', or 'assistant'
- A 'content' key containing the actual message text

The formatting looks like:

```json
 {
    "messages": \[
        {
            "role": "system",
            "content": "You are a study skills coach. Help students develop effective learning strategies and academic skills."
        },
        {
            "role": "user",
            "content":  “I have a history exam next week covering the entire semester, and there is so much material to review. How should I organize my study time?”
        },
        {
            "role": "assistant",
            "content": “Let's create a structured approach for your history exam preparation. First, gather all your class notes, readings, and past assignments. Break the semester's content into main themes or time periods. Start with a quick review of each section to identify areas where you need more focus. Create summary sheets for key events, dates, and concepts”
        }
    \]
}
```

During the fine-tuning process, the model will specifically look for the 'messages' key in your dataset structure. When this key is missing, the model will generate a warning, but you won't see it in the standard Colab output – it only appears in the runtime logs. This can be particularly challenging to troubleshoot since the training process will terminate early without obvious errors. You will know something went wrong if the process only produces a single ‘training_params.json’ file instead of the complete set of training output files.

I formatted the data as JSONL (JavaScript Object Line Notation) for easier processing and compatibility with the fine-tuning requirements. Below is the Python code for preprocessing and cleaning your dataset. When adapting this code, you might want to consider carefully which columns from your dataset should map to user prompts versus assistant responses. The system message can remain constant across all entries, and any additional metadata columns can be removed.

```py
import pandas as pd
import json


def filter_json(inputFile, outputFile, columnsToKeep):
    with open(inputFile, 'r', encoding='utf-8') as infile, open(outputFile, 'w', encoding='utf-8') as outfile:

        for line in infile:
            #parse each line in the input file
            data = json.loads(line)

            #Create the user_prompt
            user_prompt = f"title: {data['title']} \n keywords: {data['keywords']}"

            #Create the message structure
            formatted_data = {
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a tech support assistant for school district staff. Provide clear, step-by-step solutions to technical problems, using patient and respectful language to guide users through troubleshooting processes."
                    },
                    {
                        "role": "user",
                        "content": user_prompt
                    },
                    {
                        "role": "assistant",
                        "content": data['description_text']
                    }
                ]
            }

            #Write formatted data into new file
            outfile.write(json.dumps(formatted_data, ensure_ascii=False) + '\n')

inputFile = 'dataset.jsonl'

```

**Connecting to Hugging Face**🤗 **and Uploading the Dataset**

Now that our dataset is ready, we can go ahead and push it to the Hugging Face🤗 hub as follows:

Install the huggingface_hub library

```py
!pip install huggingface_hub
```

Connect to your Hugging Face🤗 account

To connect to your Hugging Face🤗 account, you will need to create a [personal access token](https://huggingface.co/docs/hub/en/security-tokens)

```py
from google.colab import userdata

HF_USERNAME = "YOUR_USERNAME" # @param {"type":"string","placeholder":"HuggingFace Username"}

HF_TOKEN = userdata.get('HF_TOKEN')

```

Google Colab gives you the possibility to save your token under secrets (the little key symbol on the sidebar), for use throughout the notebook.

Choose the dataset name and push it to the Hugging Face🤗 hub

```py
from huggingface_hub import HfApi, upload_file, login

# Authenticate with Hugging Face if needed
login()

# Define the repository details
username = HF_USERNAME
dataset_name = "YOUR_DATASET_NAME"  # @param {"type":"string","placeholder":"Dataset Name"}

repo_id = f"{username}/{dataset_name}"

# Path to your dataset file
dataset_path = "LOCAL_PATH_TO_YOUR_DATASET"  #

# Initialize the HfApi client
api = HfApi()

# Create a new dataset repository
api.create_repo(repo_id=repo_id, repo_type="dataset", exist_ok=True)

# Upload the dataset file to the repository
upload_file(
    path_or_fileobj=dataset_path,
    path_in_repo="YOUR_DATASET_NAME",
    repo_id=repo_id,
    repo_type="dataset",
    commit_message="YOUR_COMMIT_MESSAGE",
)
print(f"Dataset '{repo_id}' has been successfully pushed to the Hugging Face Hub.")


```

You can check your Hugging Face🤗 account to make sure the dataset is present. Once done, you can move with fine-tuning the model on your custom dataset.

**Fine tuning the model**

The following steps walk you through the fine-tuning process:

Install Autotrain advanced

```py
!pip install autotrain-advanced

```

Set fine tuning parameters

```py
from autotrain.params import LLMTrainingParams
from autotrain.project import AutoTrainProject

model_name = "meta-llama/Llama-3.2-1B-Instruct" # @param {"type":"string","placeholder":"original model name"}
data_path = "PATH_TO_DATASET_REPO_IN_HF" # @param {"type":"string","placeholder":"path to dataset on HF"}
project_name = "YOUR_MODEL_NAME" # @param {"type":"string","placeholder":"new model name"}

params = LLMTrainingParams(
    model = model_name,
    data_path = data_path,
    chat_template="tokenizer",
    text_column="messages",
    train_split="train",
    trainer="sft",
    epochs=5,
    batch_size=1,
    lr=2e-5,
    peft=True,
    quantization="int8",
    target_modules="all-linear",
    padding="right",
    optimizer="paged_adamw_8bit",
    scheduler="cosine",
    gradient_accumulation=8,
    mixed_precision="bf16",
    merge_adapter=False,
    project_name = project_name,
    log="tensorboard",
    push_to_hub=False,
    username=HF_USERNAME,
    token=HF_TOKEN,
)

```

The data_path is typically in the form: “HF_ACCOUNT_NAME/DATASET_REPO_NAME”  
Run the fine-tuning process

```py
project = AutoTrainProject(params=params, backend="local", process=True)
project.create()

```

If your fine-tuning process ran successfully, you should be able to see a bunch of files generated containing information about the training process. If only the training_params.json file is generated, check the format of your data, making sure that it is formatted as specified above. The model won’t train if your data is not in the right format.

**Pushing the model to the Hugging Face**🤗 **hub**

Before pushing your fine-tuned model to Hugging Face🤗, you will need to remove your authentication token from the parameters. Google Colab blocks uploads containing tokens as a security measure, preventing accidental exposure of your credentials. Once you have removed the token, you can proceed with uploading your model to the hub.

Remove the HF token from the params file

```py
# Load the training_params.json file
import json
with open("/content/{project_name}/training_params.json", "r") as f:
    training_params = json.load(f)

# Remove the token
if "token" in training_params:
    del training_params["token"]

# Save the modified file
with open(f"/content/{project_name}/training_params.json", "w") as f:
    json.dump(training_params, f, indent=4)

print("HF_TOKEN removed from training_params.json")

```

Push the model to the hub

```py
from huggingface_hub import HfApi

repo_id = f"{HF_USERNAME}/{project_name}"

# Create and push to a new repository
api = HfApi()
api.create_repo(repo_id=repo_id, exist_ok=True, token=HF_TOKEN)

# Upload files from the local directory to the new repository

folder_path = f"/content/{project_name}"

api.upload_folder(
    folder_path=folder_path,
    repo_id=repo_id,
    repo_type="model",
    token=HF_TOKEN
)

```

The model is now accessible on your Hugging Face🤗 account, ready to be downloaded and used. You can access it either directly on your local machine or through Google Colab.

**Creating a GGUF format of the model**

To deploy your model for practical applications like local chatbots or AI systems such as Ollama, you will need to convert it to GGUF format. This format is optimized for efficient loading and inference, though you will still need a computer with sufficient GPU resources to run it effectively.

Merge the fine-tuned and base models to have it as a standalone

```py
from peft import PeftConfig, PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load the base model
base_model_name = "meta-llama/Llama-3.2-1B-Instruct"
model = AutoModelForCausalLM.from_pretrained(base_model_name)

# Load the fine-tuned model
adapter_model_name = "HF_FINED_TUNED_MODEL_PATH"
model = PeftModel.from_pretrained(model, adapter_model_name)

# Merge and save
model = model.merge_and_unload()
model.save_pretrained("MERGED_MODEL_NAME")

# Save the tokenizer
tokenizer = AutoTokenizer.from_pretrained(adapter_model_name)
tokenizer.save_pretrained("MERGED_MODEL_NAME")
print("Successful merging")

```

Convert to gguf format

```py
!git clone https://github.com/ggerganov/llama.cpp.git

#Installing required python libraries
!pip install -r llama.cpp/requirements.txt

#verify the script is there and understand the various options
!python llama.cpp/convert_hf_to_gguf.py -h

#Convert the hf model to gguf format
!python llama.cpp/convert_hf_to_gguf.py merged_psd_solutions_model \
  --outfile psd_solutions_model.gguf \
  --outtype q8_0
#Verify that the gguf model was created
!ls -lash psd_solutions_model.gguf

#Pushing the gguf model to huggingface
from huggingface_hub import HfApi
api = HfApi()

model_id = "NEW_REPO_FOR_GGUF_MODEL"
api.create_repo(model_id, exist_ok=True, repo_type="model")
api.upload_file(
    path_or_fileobj="GGUF_FILE_NAME.gguf",
    path_in_repo="GGUF_FILE_NAME.gguf",
    repo_id=model_id,
)


```

Typically the new repository for the gguf model should look like : “account_name/model_name”

**Downloading the model from Hugging Face**🤗

The GGUF format produces a single file that you can download directly from Hugging Face🤗. To download the original version, you can proceed as follows:

```py
from huggingface_hub import snapshot_download

model_id = "PATH_TO_MODEL_REPO" # @param {"type":"string","placeholder":"HF repo name"}
local_dir = "LOCAL_PATH_FOR_YOUR_MODEL" # @param {"type":"string","placeholder":"local directory"}

# Download the model using snapshot_download
snapshot_download(repo_id=model_id,local_dir=local_dir)

```

**Prompting the model**

Before prompting the model, let us fit the output to the screen.

```py
from IPython.display import HTML, display

def set_css():
  display(HTML('''
  <style>
    pre {
        white-space: pre-wrap;
    }
  </style>
  '''))
get_ipython().events.register('pre_run_cell', set_css)

```

Prompt the model

```py
# @title Prompt the model

from transformers import pipeline

# Specify the local path where the model is saved
local_model_path = "LOCAL_PATH_FOR_MODEL"  # @param {"type":"string","placeholder":"path to the model"}

# User input prompt for the message content
user_input = "ENTER_A_PROMPT"  # @param {"type":"string","placeholder":"prompt"}

# Load the model from the local path
pipe = pipeline("text-generation", model=local_model_path, device=0)  # Device=0 for GPU or -1 for CPU

# Function to send a new message using the already-loaded pipeline
def send_message(content):
    messages = [{"role": "user", "content": content}]
    response = pipe(messages, max_new_tokens=400)  # Adjust max_new_tokens as needed. 400 is often insufficient

    # Extract just the assistant's response content
    if isinstance(response, list) and len(response) > 0:
        if 'generated_text' in response[0]:
            generated_text = response[0]['generated_text']
            if isinstance(generated_text, list):
                for message in generated_text:
                    if message.get('role') == 'assistant':
                        return message.get('content', '')

    # Fallback: return the full response if we can't parse it
    return str(response)

# Generate the initial response using the user input
initial_response = send_message(user_input)
print("Initial response:", initial_response)

# You can send another message with:
#new_message = "ENTER_A_ANOTHER_PROMPT"
#response = send_message(new_message)
#print("Response to new message:", response)

```

You have now successfully fine-tuned the Meta Llama3-2-1b-Instruct model on your custom dataset. If you have advanced knowledge of model training, you can experiment with different hyperparameters to further optimize the model's performance for your specific use case.

Acknowledgments:

- The [notebook I learned the process from was written by Jeremie Rostan](https://colab.research.google.com/drive/1BypTXk-gmmlQQ0hqofyAmIUBseRjalX1?usp=sharing)
