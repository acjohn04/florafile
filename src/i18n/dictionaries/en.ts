export const en = {
  navigation: {
    garden: "Garden",
    identify: "Identify",
    schedule: "Schedule",
    doctor: "Doctor"
  },
  dashboard: {
    title: "My Conservatory",
    plantsThriving: "{count} {plantWord} thriving", // Needs logic in helper
    plantsThrivingSingle: "plant",
    plantsThrivingPlural: "plants",
    addNewPlant: "Add New Plant",
    addNewPlantDesc: "Snap a photo and AI will identify it instantly.",
    weeklyPlaybook: "Weekly Playbook",
    weeklyPlaybookDesc: "Your smart schedule for watering and care.",
    inventory: "Inventory",
    noPlantsTitle: "No plants yet",
    noPlantsDesc: "Start building your digital garden.",
    addFirstPlant: "Add your first plant",
    deleteConfirm: "Are you sure you want to delete this plant?"
  },
  identify: {
    title: "Identify Plant",
    subtitle: "Take a photo of a plant to identify it and get care instructions.",
    failedError: "Failed to identify plant",
    addToGarden: "Add to My Garden"
  },
  confirm: {
    title: "Confirm Details",
    subtitle: "Almost done! Where will this plant live?",
    nicknameLabel: "Nickname (optional)",
    nicknamePlaceholder: "e.g. Robert Planter",
    locationLabel: "Location",
    saveButton: "Save to Inventory",
    savingButton: "Saving...",
    loading: "Loading...",
    failedSave: "Failed to save plant",
    rooms: {
      livingRoom: "Living Room",
      bedroom: "Bedroom",
      office: "Office",
      kitchen: "Kitchen",
      bathroom: "Bathroom",
      balcony: "Balcony",
      hallway: "Hallway"
    }
  },
  playbook: {
    title: "Weekly Playbook",
    subtitle: "Your smart schedule for plant care.",
    sync: "Sync",
    loading: "Loading schedule...",
    noPlaybookTitle: "No Playbook Generated",
    noPlaybookDesc: "Let AI create a customized care schedule for your plants.",
    generateButton: "Generate Playbook",
    tasksCount: "({count} tasks)",
    noTasks: "No tasks scheduled for today. Your plants are resting!",
    days: {
      sunday: "Sunday",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday"
    }
  },
  doctor: {
    title: "Plant Doctor",
    subtitle: "Take a photo of a sick plant to get an AI diagnosis and recovery plan.",
    failedError: "Failed to diagnose plant",
    severity: "Severity",
    whatsHappening: "What's Happening",
    recoveryPlan: "Recovery Plan"
  },
  components: {
    imageUploader: {
      retakePhoto: "Retake Photo",
      analyzing: "Analyzing Plant...",
      tapToSnap: "Tap to Snap or Upload",
      makeSureLeavesVisible: "Make sure the leaves are clearly visible"
    },
    plantCard: {
      deleteConfirm: "Are you sure you want to delete this plant?"
    },
    careSummaryGrid: {
      light: "Light",
      water: "Water",
      toxicity: "Toxicity",
      careLevel: "Care Level"
    },
    statusBadge: {
      healthy: "Healthy",
      needsWater: "Needs Water",
      pruneSoon: "Prune Soon"
    }
  },
  plantDetail: {
    editTitle: "Edit Plant",
    nicknameLabel: "Nickname",
    locationLabel: "Location",
    saveButton: "Save Changes",
    savingButton: "Saving...",
    failedSave: "Failed to save changes",
    successSave: "Changes saved successfully",
    backToDashboard: "Back to Dashboard"
  }
};
