# 📝 Question Upload Instructions

## 🎯 CSV Format Guide

### **Required Columns**

Your CSV file must have these columns:

1. **title** - Question text (required)
2. **body** - Detailed question body (optional)
3. **subject_id** - Subject ID (required, must be valid ID from database)
4. **category_id** - Category ID (required, must be valid ID from database)
5. **difficulty** - Difficulty level 1-5 (required)
6. **marks** - Points for correct answer (required)
7. **negative_marks** - Points deducted for wrong answer (required, use 0 for no penalty)
8. **option1** - First option (required)
9. **option2** - Second option (required)
10. **option3** - Third option (optional)
11. **option4** - Fourth option (optional)
12. **option5** - Fifth option (optional)
13. **correct_answer** - Index of correct option, 1-5 (required)

---

## 📊 Your Current Database IDs

### **Available Subjects:**
- **1** - Frontend
- **2** - Mathematics
- **3** - Physics
- **4** - Chemistry
- **5** - Biology
- **6** - English Literature

### **Available Categories:**
- **1** - HTML
- **2** - General Knowledge
- **3** - Mathematics
- **4** - Science
- **5** - English
- **6** - History

---

## ✅ Example CSV Format

```csv
title,body,subject_id,category_id,difficulty,marks,negative_marks,option1,option2,option3,option4,option5,correct_answer
"What is HTML?","HTML stands for HyperText Markup Language",1,1,1,1,0,"HyperText Markup Language","High Tech Modern Language","Home Tool Markup Language","Hyperlinks and Text Markup Language","",1
"What is 2 + 2?","Basic arithmetic",2,3,1,1,0,"3","4","5","6","",2
```

---

## 🚀 How to Upload

1. **Download the sample CSV**: `sample_questions_working.csv`
2. **Edit the file** with your questions
3. **Make sure to use valid IDs** from the lists above
4. **Upload via the Bulk Actions** page in the admin panel
5. **Select the subject and category** from the dropdowns (these will be used as defaults)

---

## ⚠️ Common Errors

### **Error: "Subject ID is required"**
- **Cause**: Missing or invalid `subject_id` in CSV
- **Fix**: Use IDs 1-6 from the subjects list above

### **Error: "Category ID is required"**
- **Cause**: Missing or invalid `category_id` in CSV
- **Fix**: Use IDs 1-6 from the categories list above

### **Error: "Difficulty must be between 1 and 5"**
- **Cause**: Invalid difficulty value
- **Fix**: Use only 1, 2, 3, 4, or 5

### **Error: "Valid Marks are required"**
- **Cause**: Missing or non-numeric marks
- **Fix**: Use positive numbers (e.g., 1, 2, 5, 10)

### **Error: "A correct answer index is required"**
- **Cause**: Invalid correct_answer value
- **Fix**: Use 1 for option1, 2 for option2, etc.

---

## 💡 Tips

1. **Start small**: Test with 5-10 questions first
2. **Use valid IDs**: Always check the subjects/categories exist in your database
3. **Check the format**: Make sure your CSV matches the template exactly
4. **Use quotes**: Wrap text containing commas in double quotes
5. **Empty options**: Leave option5 empty if you only need 4 options

---

## 📁 Sample Files Available

- `sample_questions_working.csv` - Ready to upload (10 questions)
- `simple_questions_template.csv` - Simple format template
- `questions_template.csv` - Legacy format template
- `questions_template_v2.csv` - Advanced format template

---

**Need help?** Check the available subjects and categories by running:
```bash
node scripts/check-data.js
```
