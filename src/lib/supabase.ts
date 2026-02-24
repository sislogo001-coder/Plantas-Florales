import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sqabjzshlvyrytuqcxwb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYWJqenNobHZ5cnl0dXFjeHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MTA2OTIsImV4cCI6MjA4NzM4NjY5Mn0.RMtY46vbG-EyZb1eWM_iwmWPS4WpdpCNMku3RW70eLk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la base de datos
export interface PlantAnalysis {
  id?: string
  image_url: string
  plant_name: string
  health_status: 'healthy' | 'needs_attention' | 'critical'
  health_score: number
  diagnosis: string
  care_tips: string[]
  flowering_tips: string[]
  created_at?: string
}

export interface CompostaRecipe {
  id?: string
  title: string
  author: string
  ingredients: string[]
  instructions: string
  tips: string
  likes: number
  created_at?: string
}

export interface GardeningTip {
  id?: string
  author: string
  category: string
  content: string
  likes: number
  created_at?: string
}

// Funciones para interactuar con Supabase
export const savePlantAnalysis = async (analysis: PlantAnalysis) => {
  const { data, error } = await supabase
    .from('plant_analyses')
    .insert([analysis])
    .select()
  
  if (error) {
    console.error('Error saving analysis:', error)
    return null
  }
  return data
}

export const getPlantAnalyses = async () => {
  const { data, error } = await supabase
    .from('plant_analyses')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching analyses:', error)
    return []
  }
  return data
}

export const saveCompostaRecipe = async (recipe: CompostaRecipe) => {
  const { data, error } = await supabase
    .from('composta_recipes')
    .insert([recipe])
    .select()
  
  if (error) {
    console.error('Error saving recipe:', error)
    return null
  }
  return data
}

export const getCompostaRecipes = async () => {
  const { data, error } = await supabase
    .from('composta_recipes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching recipes:', error)
    return []
  }
  return data
}

export const saveGardeningTip = async (tip: GardeningTip) => {
  const { data, error } = await supabase
    .from('gardening_tips')
    .insert([tip])
    .select()
  
  if (error) {
    console.error('Error saving tip:', error)
    return null
  }
  return data
}

export const getGardeningTips = async () => {
  const { data, error } = await supabase
    .from('gardening_tips')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching tips:', error)
    return []
  }
  return data
}

// Subir imagen a Supabase Storage
export const uploadImage = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`
  const { error } = await supabase.storage
    .from('plant-images')
    .upload(fileName, file)
  
  if (error) {
    console.error('Error uploading image:', error)
    return null
  }
  
  const { data: urlData } = supabase.storage
    .from('plant-images')
    .getPublicUrl(fileName)
  
  return urlData.publicUrl
}
