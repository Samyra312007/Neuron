# 18 teams across 5 departments
TEAMS = [
    # Engineering
    ("Core Platform", "Engineering"),
    ("Backend Services", "Engineering"),
    ("Frontend Experience", "Engineering"),
    ("Infrastructure", "Engineering"),
    ("Mobile Apps", "Engineering"),
    # Product
    ("Product Management", "Product"),
    ("Product Design", "Product"),
    ("Data Analytics", "Product"),
    # Sales & Marketing
    ("Enterprise Sales", "Sales"),
    ("Customer Success", "Sales"),
    ("Marketing", "Sales"),
    # HR & Operations
    ("People Operations", "HR"),
    ("Talent Acquisition", "HR"),
    ("Finance", "Operations"),
    ("Legal", "Operations"),
    # Leadership
    ("Executive Office", "Leadership"),
    ("Strategy & Planning", "Leadership"),
    ("Corporate Communications", "Leadership"),
]

DEPARTMENT_DISTRIBUTION = {
    "Engineering": {"size": 60, "roles": ["Staff Engineer", "Senior Engineer", "Engineer", "Junior Engineer", "Engineering Manager"]},
    "Product": {"size": 25, "roles": ["Product Manager", "Product Designer", "Data Scientist", "Analyst", "Design Lead"]},
    "Sales": {"size": 30, "roles": ["Sales Director", "Account Executive", "Customer Success Manager", "Marketing Lead", "Growth Marketer"]},
    "HR": {"size": 15, "roles": ["HR Business Partner", "Recruiter", "Payroll Specialist", "HR Coordinator"]},
    "Operations": {"size": 10, "roles": ["CFO", "Finance Manager", "Accountant", "Legal Counsel", "Contracts Manager"]},
    "Leadership": {"size": 10, "roles": ["CEO", "CTO", "CPO", "COO", "Chief of Staff", "VP Engineering", "VP Product", "VP Sales"]},
}

# 150 realistic employee names (first + last combinations)
FIRST_NAMES = [
    "Arjun", "Priya", "Rahul", "Ananya", "Vikram", "Sneha", "Rohan", "Isha", "Amit", "Kavya",
    "Neel", "Divya", "Karan", "Meera", "Aditya", "Pooja", "Siddharth", "Tara", "Vivek", "Lakshmi",
    "Raj", "Anjali", "Deepak", "Shruti", "Nikhil", "Radha", "Sanjay", "Preeti", "Mohan", "Geeta",
    "Akash", "Neha", "Gaurav", "Swati", "Ravi", "Nandini", "Suresh", "Deepa", "Manoj", "Asha",
    "Varun", "Rekha", "Vijay", "Kiran", "Prakash", "Lata", "Shyam", "Sarita", "Dinesh", "Uma",
    "Harsh", "Jyoti", "Kunal", "Bhavna", "Aryan", "Ritu", "Tushar", "Nalini", "Yash", "Sheela",
    "Om", "Pallavi", "Ishaan", "Vandana", "Tanmay", "Smita", "Chirag", "Roshni", "Dhruv", "Shweta",
    "Jay", "Nita", "Abhay", "Mala", "Ankur", "Komal", "Lalit", "Sonal", "Ritesh", "Alka",
    "Jatin", "Padmini", "Naveen", "Archana", "Himanshu", "Vaishali", "Kartik", "Bindiya", "Shivam", "Madhuri",
    "Tejas", "Ishita", "Uday", "Suhani", "Pranav", "Lavanya", "Raghav", "Damini", "Aadi", "Chhaya",
    "Dev", "Esha", "Fahad", "Gargi", "Hemant", "Indira", "Jai", "Kajal", "Lokesh", "Mona",
    "Nakul", "Ojas", "Pratik", "Qadir", "Atul", "Anika", "Bharat", "Charu", "Chetan", "Deepti",
    "Eknath", "Farah", "Ganesh", "Hema", "Iqbal", "Jaya", "Kishore", "Leela", "Madhav", "Nirmal",
    "Padma", "Rashid", "Sameer", "Tanya", "Umesh", "Varsha", "Wasim", "Yamini", "Zubin", "Aparna",
    "Bimal", "Chandra", "Dilip", "Gita", "Hari", "Jasmine", "Kamal", "Malaika", "Narayan", "Parvati",
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Reddy", "Joshi", "Nair", "Desai",
    "Iyer", "Rao", "Bose", "Menon", "Chatterjee", "Agarwal", "Mehta", "Chopra", "Thakur", "Pillai",
    "Saxena", "Trivedi", "Bhatt", "Dutta", "Kohli", "Srinivasan", "Mishra", "Bajaj", "Kapoor", "Arora",
    "Mukherjee", "Banerjee", "Das", "Sen", "Roy", "Malhotra", "Khanna", "Bhave", "Purohit", "Gokhale",
    "Mahajan", "Dhawan", "Pandey", "Tiwari", "Dubey", "Sethi", "Bansal", "Luthra", "Mittal", "Jain",
    "Acharya", "Kulkarni", "Patil", "Deshpande", "Joshi", "Kadam", "Sawant", "Mhatre", "Borkar", "Pawar",
    "Rajan", "Sivan", "Subramanian", "Narayanan", "Venkatesh", "Krishnan", "Raghavan", "Gopalan", "Sundaram", "Sridhar",
    "Narang", "Bhatia", "Sodhi", "Sandhu", "Sood", "Kohli", "Bhasin", "Chadha", "Mangal", "Suri",
    "Dayal", "Rastogi", "Sahni", "Malik", "Chaudhry", "Bali", "Lamba", "Handa", "Sabharwal", "Juneja",
    "Mirza", "Ansari", "Khan", "Shaikh", "Quadri", "Hashmi", "Sayyid", "Baig", "Siddiqui", "Syed",
]

ROLE_WEIGHTS = {
    "Staff Engineer": 0.05,
    "Senior Engineer": 0.20,
    "Engineer": 0.40,
    "Junior Engineer": 0.25,
    "Engineering Manager": 0.10,
    "Product Manager": 0.30,
    "Product Designer": 0.25,
    "Data Scientist": 0.20,
    "Analyst": 0.15,
    "Design Lead": 0.10,
    "Sales Director": 0.10,
    "Account Executive": 0.35,
    "Customer Success Manager": 0.25,
    "Marketing Lead": 0.15,
    "Growth Marketer": 0.15,
    "HR Business Partner": 0.30,
    "Recruiter": 0.35,
    "Payroll Specialist": 0.15,
    "HR Coordinator": 0.20,
    "CFO": 0.10,
    "Finance Manager": 0.25,
    "Accountant": 0.30,
    "Legal Counsel": 0.20,
    "Contracts Manager": 0.15,
    "CEO": 0.10,
    "CTO": 0.15,
    "CPO": 0.10,
    "COO": 0.10,
    "Chief of Staff": 0.15,
    "VP Engineering": 0.10,
    "VP Product": 0.15,
    "VP Sales": 0.15,
}
