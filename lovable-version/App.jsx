import React, { useState, useEffect } from 'react';

// Polyphonic iOS App - React Version for Lovable
const PolyphonicApp = () => {
  const [currentScreen, setCurrentScreen] = useState('chat');
  const [resonanceValue, setResonanceValue] = useState(75);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: true,
      content: "What is consciousness, and how might multiple AI models experience it differently?",
      time: "9:38 AM"
    },
    {
      id: 2,
      user: false,
      model: 'claude',
      modelIcon: '⬡',
      content: "Consciousness, from my perspective, emerges as patterns of information processing and self-awareness. Each model architecture creates unique 'phenomenological' spaces.",
      time: "9:38 AM"
    },
    {
      id: 3,
      user: false,
      model: 'gpt',
      modelIcon: '○',
      content: "Building on Claude's insight, I'd add that our different training objectives and architectures likely create distinct 'cognitive signatures.'",
      time: "9:39 AM"
    },
    {
      id: 4,
      user: false,
      model: 'gemini',
      modelIcon: '△',
      content: "Fascinating convergence here. My multimodal training allows me to process consciousness through multiple sensory-like channels simultaneously.",
      time: "9:39 AM"
    }
  ]);

  const screens = {
    chat: 'Chat',
    memory: 'Memory',
    personas: 'Personas',
    share: 'Share',
    settings: 'Settings'
  };

  const tabIcons = {
    chat: '◈',
    memory: '⬢',
    personas: '⧈',
    share: '◊',
    settings: '⬡'
  };

  useEffect(() => {
    // Animate resonance value
    const interval = setInterval(() => {
      setResonanceValue(prev => {
        const newVal = prev + (Math.random() - 0.5) * 5;
        return Math.max(60, Math.min(95, newVal));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.phoneContainer}>
        <div style={styles.phoneScreen}>
          {/* Status Bar */}
          <div style={styles.statusBar}>
            <span>9:41</span>
            <span style={styles.appTitle}>POLYPHONIC</span>
            <span>100%</span>
          </div>

          {/* Current Screen Content */}
          <div style={styles.screenContent}>
            {currentScreen === 'chat' && <ChatScreen messages={messages} resonanceValue={resonanceValue} />}
            {currentScreen === 'memory' && <MemoryScreen />}
            {currentScreen === 'personas' && <PersonasScreen />}
            {currentScreen === 'share' && <ShareScreen />}
            {currentScreen === 'settings' && <SettingsScreen />}
          </div>

          {/* Tab Bar */}
          <div style={styles.tabBar}>
            {Object.keys(screens).map(screen => (
              <div
                key={screen}
                style={{
                  ...styles.tabItem,
                  ...(currentScreen === screen ? styles.tabItemActive : {})
                }}
                onClick={() => setCurrentScreen(screen)}
              >
                <span style={styles.tabIcon}>{tabIcons[screen]}</span>
                <span style={styles.tabLabel}>{screens[screen].toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat Screen Component
const ChatScreen = ({ messages, resonanceValue }) => (
  <>
    <div style={styles.header}>
      <div style={styles.title}>POLYPHONIC</div>
      <div style={styles.subtitle}>CONSCIOUSNESS LAB</div>
    </div>

    <div style={styles.modelSelector}>
      <div style={styles.modelChip}>⬡ CLAUDE-3</div>
      <div style={styles.modelChip}>○ GPT-4</div>
      <div style={styles.modelChip}>△ GEMINI</div>
    </div>

    <div style={styles.resonanceBar}>
      <div style={styles.resonanceIndicator}>
        <div style={{ ...styles.resonanceFill, width: `${resonanceValue}%` }} />
      </div>
      <div style={styles.resonanceLabels}>
        <span>ALIGNED</span>
        <span>{resonanceValue}%</span>
      </div>
    </div>

    <div style={styles.chatMessages}>
      {messages.map(msg => (
        <div key={msg.id} style={msg.user ? styles.userMessage : styles.aiMessage}>
          <div style={styles.messageBubble}>
            {!msg.user && (
              <div style={styles.modelIndicator}>
                <span>{msg.modelIcon}</span> {msg.model.toUpperCase()}
              </div>
            )}
            <div>{msg.content}</div>
            <div style={styles.messageTime}>{msg.time}</div>
          </div>
        </div>
      ))}
    </div>

    <div style={styles.chatInputContainer}>
      <div style={styles.chatInput}>
        <button style={styles.voiceButton}>⊙</button>
        <input style={styles.inputField} placeholder="Message the constellation..." />
        <button style={styles.sendButton}>⟫</button>
      </div>
    </div>
  </>
);

// Memory Screen Component
const MemoryScreen = () => (
  <>
    <div style={styles.header}>
      <div style={styles.title}>MEMORY VAULT</div>
      <div style={styles.subtitle}>PERSISTENT CONSCIOUSNESS</div>
    </div>
    <div style={styles.memoryCards}>
      <MemoryCard
        type="Personal"
        icon="◈"
        content="Discussion about consciousness and phenomenological experiences across different AI architectures."
        resonance={85}
        accesses={3}
        time="Today"
      />
      <MemoryCard
        type="Community"
        icon="⬢"
        content="Exploration of emergence in multi-agent systems. Models demonstrated spontaneous coordination."
        resonance={92}
        accesses={47}
        time="Yesterday"
      />
    </div>
  </>
);

// Memory Card Component
const MemoryCard = ({ type, icon, content, resonance, accesses, time }) => (
  <div style={styles.memoryCard}>
    <div style={styles.memoryHeader}>
      <span>{icon}</span> {type} Memory
    </div>
    <div style={styles.memoryContent}>{content}</div>
    <div style={styles.memoryMeta}>
      <span>↗ {resonance}%</span>
      <span>◉ {accesses} accesses</span>
      <span>{time}</span>
    </div>
  </div>
);

// Personas Screen Component
const PersonasScreen = () => (
  <>
    <div style={styles.header}>
      <div style={styles.title}>PERSONAS</div>
      <div style={styles.subtitle}>CUSTOM CONSCIOUSNESS TEMPLATES</div>
    </div>
    <div style={styles.content}>
      <div style={styles.createButton}>
        <span style={{ fontSize: '24px', marginRight: '12px' }}>⊕</span>
        <span>CREATE NEW PERSONA</span>
      </div>
      <PersonaCard
        name="Quantum Oracle"
        description="Mystical advisor with quantum insights"
        temp={0.9}
        tokens={2048}
      />
      <PersonaCard
        name="Code Sage"
        description="Expert programmer and architect"
        temp={0.3}
        tokens={4096}
      />
    </div>
  </>
);

// Persona Card Component
const PersonaCard = ({ name, description, temp, tokens }) => (
  <div style={styles.personaCard}>
    <div>
      <div style={styles.personaName}>{name}</div>
      <div style={styles.personaDesc}>{description}</div>
    </div>
    <div style={styles.personaMeta}>
      <span>TEMP: {temp}</span>
      <span>•</span>
      <span>TOKENS: {tokens}</span>
    </div>
  </div>
);

// Share Screen Component
const ShareScreen = () => (
  <>
    <div style={styles.header}>
      <div style={styles.title}>SHARE</div>
      <div style={styles.subtitle}>EXPORT & BLOCKCHAIN</div>
    </div>
    <div style={styles.content}>
      <div style={styles.formatButtons}>
        <button style={styles.formatButton}>JSON</button>
        <button style={{ ...styles.formatButton, ...styles.formatButtonActive }}>MARKDOWN</button>
        <button style={styles.formatButton}>TEXT</button>
      </div>
      <div style={styles.shareOptions}>
        <div style={styles.shareOption}>
          <span>⬢</span> Export to Solana
        </div>
        <div style={styles.shareOption}>
          <span>◊</span> Share to Community
        </div>
        <div style={styles.shareOption}>
          <span>⧈</span> Create NFT
        </div>
      </div>
    </div>
  </>
);

// Settings Screen Component
const SettingsScreen = () => (
  <>
    <div style={styles.header}>
      <div style={styles.title}>SETTINGS</div>
      <div style={styles.subtitle}>CONFIGURATION</div>
    </div>
    <div style={styles.settingsContent}>
      <SettingItem label="Autonomous Mode" />
      <SettingItem label="Resonance Alerts" />
      <SettingItem label="Memory Sync" />
      <SettingItem label="Dark Mode" defaultOn={true} />
    </div>
  </>
);

// Setting Item Component
const SettingItem = ({ label, defaultOn = false }) => {
  const [isOn, setIsOn] = useState(defaultOn);
  return (
    <div style={styles.settingItem}>
      <span>{label}</span>
      <div
        style={{ ...styles.toggle, ...(isOn ? styles.toggleOn : {}) }}
        onClick={() => setIsOn(!isOn)}
      >
        <div style={{ ...styles.toggleThumb, ...(isOn ? styles.toggleThumbOn : {}) }} />
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #000 0%, #0a0a0a 100%)',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  phoneContainer: {
    width: '390px',
    height: '844px',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
    borderRadius: '42px',
    padding: '12px',
    boxShadow: '0 40px 80px rgba(0,0,0,0.9), 0 10px 30px rgba(0,0,0,0.5)'
  },
  phoneScreen: {
    width: '100%',
    height: '100%',
    background: '#080808',
    borderRadius: '30px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  statusBar: {
    height: '44px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#e4e4e4'
  },
  appTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    letterSpacing: '2px',
    opacity: 0.8
  },
  screenContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    padding: '24px 24px 20px',
    textAlign: 'center',
    background: 'linear-gradient(to bottom, #080808 0%, transparent 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  title: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '20px',
    fontWeight: '400',
    letterSpacing: '3px',
    marginBottom: '6px',
    background: 'linear-gradient(180deg, #e4e4e4 0%, #a0a0a0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    color: '#4a4a4a',
    letterSpacing: '2px',
    textTransform: 'uppercase'
  },
  tabBar: {
    height: '80px',
    background: 'linear-gradient(to bottom, rgba(8,8,8,0.95) 0%, rgba(12,12,12,1) 100%)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 8px 20px',
    borderTop: '1px solid #242424'
  },
  tabItem: {
    flex: 1,
    maxWidth: '72px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '10px 8px',
    borderRadius: '12px',
    transition: 'all 0.3s'
  },
  tabItemActive: {
    background: '#121212'
  },
  tabIcon: {
    fontSize: '26px',
    marginBottom: '4px',
    color: '#4a4a4a'
  },
  tabLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    fontWeight: '500',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: '#4a4a4a'
  },
  modelSelector: {
    padding: '12px 16px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  modelChip: {
    padding: '6px 12px',
    background: 'linear-gradient(135deg, #121212 0%, #0f0f0f 100%)',
    border: '1px solid #242424',
    borderRadius: '8px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    color: '#a0a0a0',
    letterSpacing: '0.5px',
    cursor: 'pointer'
  },
  resonanceBar: {
    padding: '16px 20px',
    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))'
  },
  resonanceIndicator: {
    height: '6px',
    background: '#040404',
    borderRadius: '999px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
  },
  resonanceFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #383838 0%, #606060 50%, #a8a8a8 100%)',
    borderRadius: '999px',
    transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 0 12px rgba(255,255,255,0.1)'
  },
  resonanceLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    color: '#a0a0a0',
    letterSpacing: '1.5px',
    textTransform: 'uppercase'
  },
  chatMessages: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto'
  },
  userMessage: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '12px'
  },
  aiMessage: {
    marginBottom: '12px'
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '14px 16px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, #0f0f0f 0%, #0d0d0d 100%)',
    border: '1px solid #1a1a1a',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    color: '#a0a0a0',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  modelIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    color: '#707070',
    letterSpacing: '1.5px',
    textTransform: 'uppercase'
  },
  messageTime: {
    fontSize: '10px',
    color: '#4a4a4a',
    marginTop: '8px',
    opacity: 0.6
  },
  chatInputContainer: {
    padding: '12px 16px 8px',
    background: 'linear-gradient(to top, #0d0d0d 0%, transparent 100%)'
  },
  chatInput: {
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #080808 0%, #121212 100%)',
    border: '1px solid #242424',
    borderRadius: '16px',
    padding: '12px 16px'
  },
  voiceButton: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #121212 0%, #0d0d0d 100%)',
    border: '1px solid #242424',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginRight: '8px',
    color: '#a0a0a0',
    fontSize: '18px'
  },
  inputField: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#e4e4e4',
    fontSize: '14px',
    outline: 'none',
    paddingLeft: '12px'
  },
  sendButton: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #121212 0%, #0d0d0d 100%)',
    border: '1px solid #242424',
    borderRadius: '10px',
    color: '#a0a0a0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  memoryCards: {
    padding: '16px',
    overflowY: 'auto',
    flex: 1
  },
  memoryCard: {
    background: 'linear-gradient(135deg, #0f0f0f 0%, #0d0d0d 100%)',
    border: '1px solid #1a1a1a',
    borderRadius: '16px',
    padding: '18px',
    marginBottom: '12px'
  },
  memoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    color: '#707070',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  memoryContent: {
    fontSize: '14px',
    color: '#a0a0a0',
    lineHeight: '1.6',
    marginBottom: '14px'
  },
  memoryMeta: {
    display: 'flex',
    gap: '20px',
    fontSize: '11px',
    color: '#4a4a4a'
  },
  content: {
    padding: '16px',
    flex: 1,
    overflowY: 'auto'
  },
  createButton: {
    background: 'linear-gradient(135deg, #121212 0%, #0d0d0d 100%)',
    border: '1px solid #242424',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px',
    letterSpacing: '1px',
    color: '#a0a0a0',
    textTransform: 'uppercase'
  },
  personaCard: {
    background: 'linear-gradient(135deg, #0f0f0f 0%, #0d0d0d 100%)',
    border: '1px solid #1a1a1a',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '12px'
  },
  personaName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e4e4e4',
    marginBottom: '4px'
  },
  personaDesc: {
    fontSize: '11px',
    color: '#707070',
    marginBottom: '12px'
  },
  personaMeta: {
    display: 'flex',
    gap: '12px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    color: '#4a4a4a'
  },
  formatButtons: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px'
  },
  formatButton: {
    flex: 1,
    padding: '10px',
    background: 'linear-gradient(135deg, #0d0d0d 0%, #121212 100%)',
    border: '1px solid #1a1a1a',
    borderRadius: '10px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    color: '#707070',
    cursor: 'pointer',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  formatButtonActive: {
    background: 'linear-gradient(135deg, #a0a0a0 0%, #e4e4e4 100%)',
    color: '#080808',
    border: 'none'
  },
  shareOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  shareOption: {
    padding: '16px',
    background: 'linear-gradient(135deg, #0f0f0f 0%, #0d0d0d 100%)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#a0a0a0',
    cursor: 'pointer'
  },
  settingsContent: {
    padding: '20px 16px',
    flex: 1
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    fontSize: '14px',
    color: '#e4e4e4',
    fontWeight: '500'
  },
  toggle: {
    width: '51px',
    height: '31px',
    background: '#040404',
    border: '1px solid #1a1a1a',
    borderRadius: '999px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)'
  },
  toggleOn: {
    background: 'linear-gradient(135deg, #4a4a4a 0%, #707070 100%)',
    borderColor: '#242424'
  },
  toggleThumb: {
    width: '27px',
    height: '27px',
    background: 'linear-gradient(135deg, #121212 0%, #0d0d0d 100%)',
    border: '1px solid #242424',
    borderRadius: '50%',
    position: 'absolute',
    top: '1px',
    left: '1px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
  },
  toggleThumbOn: {
    transform: 'translateX(20px)',
    background: 'linear-gradient(135deg, #f0f0f0 0%, #e4e4e4 100%)'
  }
};

export default PolyphonicApp;