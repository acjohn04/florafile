export const en = {
  navigation: {
    garden: "Garden",
    identify: "Identify",
    schedule: "Schedule",
    settings: "Settings",
    signOut: "Sign Out"
  },
  dashboard: {
    title: "My Garden",
    plantsThriving: "{count} {plantWord} thriving", // Needs logic in helper
    plantsThrivingSingle: "plant",
    plantsThrivingPlural: "plants",
    plantsAttention: ", {count} {attentionWord}",
    plantsAttentionSingle: "plant needs attention",
    plantsAttentionPlural: "plants need attention",
    addNewPlant: "Add New Plant",
    addNewPlantDesc: "Snap a photo and AI will identify it instantly.",
    weeklyPlaybook: "Smart Schedule",
    weeklyPlaybookDesc: "AI-generated care schedule for your plants.",
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
    title: "Smart Schedule",
    subtitle: "AI-generated care routine for your plants",
    sync: "Sync to Calendar",
    update: "Update Schedule",
    loading: "Consulting the master gardener...",
    noPlaybookTitle: "Ready to schedule?",
    noPlaybookDesc: "Let AI create a customized 3-month calendar for your plants.",
    generateButton: "Download .ics Calendar",
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
      sick: "Sick",
      needsWater: "Needs Water",
      pruneSoon: "Prune Soon"
    }
  },
  plantDetail: {
    editTitle: "Plant Details",
    nicknameLabel: "Nickname",
    locationLabel: "Location",
    saveButton: "Save Changes",
    savingButton: "Saving...",
    failedSave: "Failed to save changes",
    successSave: "Changes saved successfully",
    backToDashboard: "Back to Dashboard",
    diagnosing: "Checking plant health...",
    diagnosisTitle: "Health Diagnosis",
    whatsHappening: "What's Happening",
    recoveryPlan: "Recovery Plan",
    severity: "Severity",
    healthyStatus: "Your plant looks healthy! No issues detected.",
    careSummaryTitle: "Care Summary"
  },
  settings: {
    title: "Settings",
    householdTitle: "Your Household",
    householdIdLabel: "Household ID",
    householdIdDesc: "Share this ID with others in your home so they can join your household.",
    copyButton: "Copy",
    copiedButton: "Copied!",
    joinTitle: "Join a Household",
    joinDesc: "Enter a household ID from someone in your home to share their plants and schedule.",
    joinPlaceholder: "Paste household ID here",
    joinButton: "Join Household",
    joiningButton: "Joining...",
    joinSuccess: "You have joined the household!",
    joinError: "Household not found. Check the ID and try again.",
    locationsTitle: "Manage Locations",
    locationsDesc: "Customize the list of rooms and locations where your plants live.",
    addLocationPlaceholder: "New location name",
    addLocationButton: "Add",
    deleteLocationButton: "Delete",
    saveLocationButton: "Save",
    cancelLocationButton: "Cancel",
    profileTitle: "Your Profile",
    signOut: "Sign Out"
  },
  plantHistory: {
    title: "Plant Timeline",
    emptyTitle: "No History Yet",
    emptyDescription: "Upload a new photo to start tracking your plant's journey.",
    healthy: "Healthy",
    sick: "Sick",
  }
};
