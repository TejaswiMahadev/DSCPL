import streamlit as st
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferWindowMemory
from dotenv import load_dotenv
import os

st.set_page_config(page_title="DSCPL", page_icon="🧭")

# --- 1. SETUP ---
# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# Configure both genai and pass api_key explicitly
genai.configure(api_key=api_key)

# --- 2. RAG (RETRIEVAL-AUGMENTED GENERATION) SETUP ---
@st.cache_resource
def load_and_process_data():
    """Loads text, splits it, and creates a vector store."""
    
    # Check if bible_verses.txt exists
    if not os.path.exists("asv.txt"):
        st.error("bible_verses.txt file not found. Please make sure the file exists in your project directory.")
        st.stop()
    
    with open("asv.txt", "r", encoding="utf-8") as f:
        text = f.read()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = text_splitter.split_text(text)
    
    # Pass the API key explicitly to GoogleGenerativeAIEmbeddings
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=api_key  # Add this line
    )
    vector_store = FAISS.from_texts(texts, embeddings)
    return vector_store

# Only load vector store if API key is available
if api_key:
    vector_store = load_and_process_data()
else:
    st.error("Google API Key not found. Please set GOOGLE_API_KEY in your .env file.")
    st.stop()

# --- 3. LANGCHAIN & GEMINI SETUP ---
@st.cache_resource
def create_conversational_chain(_vector_store):
    """Creates the LangChain conversational retrieval chain."""
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash", 
        temperature=0.7, 
        google_api_key=api_key,  # Add this line
        convert_system_message_to_human=True
    )
    
    memory = ConversationBufferWindowMemory(
        k=5, 
        memory_key="chat_history", 
        return_messages=True,
        output_key='answer'
    )

    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=_vector_store.as_retriever(),
        memory=memory,
        get_chat_history=lambda h: h,
        return_source_documents=True
    )
    return chain

chain = create_conversational_chain(vector_store)

# --- 4. CONTENT GENERATION FUNCTIONS ---
def generate_content(category, topic):
    """Generates structured content based on the user's selection."""
    prompt = ""
    if category == "Devotion":
        prompt = f"""
        You are DSCPL, a personal spiritual assistant. 
        Create a 5-minute daily devotional on the topic of '{topic}'. 
        Follow this exact structure:
        - **✝️ Scripture:** Choose a relevant Bible verse.
        - **📖 5-minute Reading:** Write a short, encouraging reflection (2-3 paragraphs) on the verse and topic.
        - **🙏 Short Prayer:** Write a 2-3 sentence prayer related to the topic.
        - **💪 Faith Declaration:** Write a powerful "I am" or "I will" statement.
        - **🎥 Recommended Video:** Suggest a conceptual video topic, like "A video on finding peace in God's promises."
        """
    elif category == "Prayer":
        prompt = f"""
        You are DSCPL, a personal spiritual assistant.
        Guide the user through a prayer on the topic of '{topic}' using the ACTS model.
        - **Adoration:** Start with a prompt to praise God for who He is.
        - **Confession:** Gently guide the user to confess any shortcomings related to '{topic}'.
        - **Thanksgiving:** Prompt the user to thank God for His blessings.
        - **Supplication:** Help the user make specific requests to God about '{topic}'.
        - **Daily Prayer Focus:** Add a specific action point, e.g., "Today, pray for wisdom in a difficult situation."
        """
    elif category == "Meditation":
         prompt = f"""
        You are DSCPL, a personal spiritual assistant.
        Create a guided meditation on the topic of '{topic}'.
        - **🧘 Scripture Focus:** Select one potent verse for meditation.
        - **🤔 Meditation Prompts:** Provide 2-3 deep questions for reflection, like "What does this reveal about God?"
        - **🌬️ Breathing Guide:** Include a simple instruction: "Breathe deeply. Inhale for 4 seconds, hold for 4, and exhale for 4. Focus on the scripture as you breathe."
        """
    elif category == "Accountability":
        prompt = f"""
        You are DSCPL, a personal spiritual assistant.
        Provide strength and accountability for someone struggling with '{topic}'.
        - **🛡️ Scripture for Strength:** Choose a powerful verse about overcoming temptation or finding freedom.
        - **📢 Truth Declarations:** Write 2-3 strong "I am..." statements based on scriptural truth.
        - **🔁 Alternative Actions:** Suggest a healthy, positive action to take instead of giving in. Example: "Instead of [vice], try [healthy action]."
        - **🚨 SOS Feature Info:** Remind them: "If you need immediate help, use the 'SOS' button for urgent encouragement."
        """

    # Generate the content using Gemini
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash", 
        temperature=0.7,
        google_api_key=api_key  # Add this line
    )
    response = llm.invoke(prompt)
    return response.content

# --- 5. STREAMLIT UI ---

st.title("🧭 DSCPL - Your Personal Spiritual Assistant")

# Initialize session state variables
if 'stage' not in st.session_state:
    st.session_state.stage = 'initial_selection'
if 'category' not in st.session_state:
    st.session_state.category = ''
if 'topic' not in st.session_state:
    st.session_state.topic = ''
if 'messages' not in st.session_state:
    st.session_state.messages = []

# --- USER FLOW MANAGEMENT ---

# STEP 1: Initial Selection
if st.session_state.stage == 'initial_selection':
    st.header("What do you need today?")
    
    cols = st.columns(2)
    if cols[0].button("✝️ Daily Devotion", use_container_width=True):
        st.session_state.category = "Devotion"
        st.session_state.stage = 'topic_selection'
        st.rerun()
    if cols[1].button("🙏 Daily Prayer", use_container_width=True):
        st.session_state.category = "Prayer"
        st.session_state.stage = 'topic_selection'
        st.rerun()
    if cols[0].button("🧘 Daily Meditation", use_container_width=True):
        st.session_state.category = "Meditation"
        st.session_state.stage = 'topic_selection'
        st.rerun()
    if cols[1].button("🛡️ Daily Accountability", use_container_width=True):
        st.session_state.category = "Accountability"
        st.session_state.stage = 'topic_selection'
        st.rerun()
    if st.button("💬 Just Chat", use_container_width=True, type="primary"):
        st.session_state.category = "Chat"
        st.session_state.stage = 'chat'
        st.rerun()

# STEP 2: Topic Selection
elif st.session_state.stage == 'topic_selection':
    st.header(f"Choose a Topic for Your {st.session_state.category}")

    topics = {
        "Devotion": ["Dealing with Stress", "Overcoming Fear", "Relationships", "Healing", "Purpose & Calling"],
        "Prayer": ["Personal Growth", "Healing", "Family/Friends", "Forgiveness", "Finances"],
        "Meditation": ["Peace", "God's Presence", "Strength", "Wisdom", "Faith"],
        "Accountability": ["Pornography", "Laziness", "Anger", "Gossip", "Addiction"]
    }

    selected_topics = topics.get(st.session_state.category, [])
    for topic in selected_topics:
        if st.button(topic, use_container_width=True):
            st.session_state.topic = topic
            st.session_state.stage = 'confirmation'
            st.rerun()
    
    custom_topic = st.text_input("Or, choose something else...", key="custom_topic")
    if st.button("Go with Custom Topic", use_container_width=True) and custom_topic:
        st.session_state.topic = custom_topic
        st.session_state.stage = 'confirmation'
        st.rerun()
    
    if st.button("← Go Back"):
        st.session_state.stage = 'initial_selection'
        st.rerun()

# STEP 3 & 4: Confirmation & Goal Setting
elif st.session_state.stage == 'confirmation':
    st.header("Weekly Overview & Goal Setting")
    st.write(f"You've chosen **{st.session_state.category}** focusing on **{st.session_state.topic}**.")
    st.info("By the end of this week, you will feel more connected to God and confident in your spiritual journey.")
    
    if st.button("✅ Yes, let's begin!"):
        st.session_state.stage = 'program_delivery'
        st.toast("Great! Your program is set. We'll remind you daily.") 
        st.rerun()
    if st.button("← Go Back"):
        st.session_state.stage = 'topic_selection'
        st.rerun()

# STEP 5: Daily Program Delivery & Chat
elif st.session_state.stage in ['program_delivery', 'chat']:
    st.header(f"Day 1: {st.session_state.category} on {st.session_state.topic}")
    st.markdown("---")

    # Display generated content for the program
    if st.session_state.stage == 'program_delivery':
        with st.spinner("Preparing your daily content..."):
            daily_content = generate_content(st.session_state.category, st.session_state.topic)
            st.markdown(daily_content)
        
        # SOS Button for Accountability
        if st.session_state.category == "Accountability":
            if st.button("🚨 I need help now! (SOS)", type="primary"):
                 st.error("You are strong in Christ! Take a deep breath. Read this: **'No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear.' - 1 Corinthians 10:13**. Now, step away from the situation for 5 minutes and call a trusted friend.")

    st.markdown("---")
    st.subheader("Chat with DSCPL")

    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Chat input
    if prompt := st.chat_input("Ask a question about the topic or any scripture..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                result = chain({"question": prompt, "chat_history": [(msg["role"], msg["content"]) for msg in st.session_state.messages]})
                response_text = result['answer']
                st.markdown(response_text)
                # Optionally display source documents
                with st.expander("Show relevant verses (from RAG)"):
                    for doc in result['source_documents']:
                        st.write(doc.page_content)

        st.session_state.messages.append({"role": "assistant", "content": response_text})
    
    if st.button("🏠 Return to Main Menu"):
        # Reset state
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()