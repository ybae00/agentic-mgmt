This is the UX flow and concept of the product.

Shortly described at [[Thought dump]], the UX should follow: 

---
## The product concept

The product is a an ai agent where you can build complex hardware, such as robots, rockets, and nuclear plants.

The agent will have access to software coding tools, CAD, exel, and engineering tools to build actual assets and engineer hardware. 

The user will prompt the agent to go through the designs and see what are working, validated, verify, test, document and etc.

Agent's every task will be recorded with node, all connected. The reason behind this is: The tasks agents do is complex and user wouldn't want to see every task they are doing. But the user still wants the ability to see which task the agent is doing and if it is doing right. 

### persona

The user is: A senior hardware engineer that oversee all the project scope of building the hardware. 

The user will need to go and verify the designs, engineering, concepts and tests. 

The user spends time on managing the agents.

### ux flow / user journey

1. The user comes into the app
2. Wants to see if the launch vehicle is working well with the CAD design, software, and engineering data. He prompts the ai to check all of them, fix anything if there is anything needed to be fixed. He writes this into a prompt and sends it
3. The prompt sends, prompt bar moves from the center to the bottom
4. The agent answer is shown above the prompt bar, with  opacity gradient on the top part, making the answers dissolve disappear towards the top. 
5. The agent starts working.
6. The node is created.
7. The agentic work is mostly agentic. Meaning the node goes linear. 
8. Because the agents needs to work on multiple apps and agents, it needs to create a non linear node branch to indicate this. 
   For example: the start state is open the CAD. Every task happening on CAD will be linear. However when the agent needs to open a new software like python, then a new node should branch out and start it's new linear action nodes. This branching will happen multiple times, meaning this will happen simultaneously and all together.
9. If there needs a approval on a particular stage, the agent node is now colored (alert) to check and approve the action.
10. To approve, the user only has to click the 'approve' button from the pop-up from the node. 
11. When user wants to see deeply and investigate, the user click 'investigate'
12. If user click investigate: The whole screen is split and pushed to left, revealing a desktop screen on the right side. From the desktop, 'that' app is already loaded, with the screen that is needed approval. User can interact and investigate the screen within that app.


