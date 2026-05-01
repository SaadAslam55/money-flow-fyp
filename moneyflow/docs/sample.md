Cric Craft Cricket Analysis System
Final Year Project
Session 2022-2026


A project submitted in partial fulfilment of the requirements for the Degree
of 
BS in Software Engineering 

 

Department of Computer Science
COMSATS University Islamabad (CUI), Lahore Campus

 
Project Details
Project ID (for office use) 	SP2SE22
Type of project	[ -] Traditional   	          [  ] Industrial		[  ] Continuing
Nature of project	[ -] Development            [  ] Research & Development 
Sustainable Development Goals(SDGs)	[  ] Good Health and Well-Being                      [ -] Quality Education 
[  ]  Industry, Innovation, and Infrastructure     [  ] Gender Equality
[  ] Decent Work and Economic Growth           [  ]  Climate Action
Area of specialization	[  ] Artificial Intelligence (AI)      [  ] Blockchain               [  ] Cybersecurity
[  ] Data Science and Analytics    [  ] Game Development
[  ] Internet of Things (IoT)          [  ]  Natural Language Processing (NLP)
[  ] Mobile App Development      [ -]  Web Development
Project Group Members
Sr.#	Reg. #	Student Name	Email ID	Signature
(i)	SP22-BSE-112	Ehtisham Ahmed Gondal	SP22-BSE-112@cuilahore.edu.pk
 
(ii)	SP22-BSE-100	Syeda Saleha Khubaib	SP22-BSE-100@cuilahore.edu.pk
 
(iii)	SP22-BSE-030	Hafiz Mutahar Hashmi	SP22-BSE-030@cuilahore.edu.pk	 
Declaration: The candidates confirm that the work submitted is their own and appropriate credit has been given where reference has been made to the work of others.	
Plagiarism Free Certificate
This is to certify that, I am Ehtisham Ahmed Gondal S/o Masood Ahmed Gondal, group leader of FYP under registration no CUI /SP22-BSE-112/LHR at the Computer Science Department, COMSATS University Islamabad, Lahore Campus. I declare that my FYP proposal is checked by my supervisor and the similarity index is ________% that is less than 20%, an acceptable limit by HEC. The report is attached herewith as Appendix A.
Date: _________   Name of Group Leader: Ehtisham Ahmed Gondal Signature:  
Name of Supervisor: Dr Junaid Akram 	Co-Supervisor (if any):_________________
Designation:	Assistant Professor 	            Designation:	_____________________
Signature:	_____________________ 	Signature:	_____________________

HoD: 	Dr Farooq Ahmed 
Signature: _____________________
ABSTRACT 
Accessing the detailed results of tournaments and matches can be a challenge for both coaches and players. The players often have difficulty obtaining their own stats or match videos, which is crucial to evaluating their performances and helping them improve. Cricket analysis systems are more sophisticated in India than in Pakistan. This gap highlights the need for a reliable and modern solution. It is addressed by our Cricket Analysis System (Cric-Craft), which provides comprehensive real-time data reports and match videos. It also offers graphical displays of player performance, customized for both coaches and players. This system, which offers detailed visualizations and easily accessible stats, aims to raise the standard of analysis for cricket in Pakistan by helping both players and coaches make better decisions. It encourages a culture of performance transparency and accountability among players. This system includes a web portal to track personal statistics. With this portal Analysts, Coaches can easily make smarter, data-driven decisions. It allows users to consistently monitor their progress and adjust their practices accordingly and to be informed about their performance and make improvements. This solution is not just about improving individual performances, but also establishes a structured, professional framework for analysis. This solution aims to provide a solid foundation to advance the sport analysis industry in Pakistan while also developing better talent pathways and improving national-levels outcomes.
.




































Acknowledgement 
“We want to express our deep gratitude to Sir Junaid Akram for his unwavering support and mentorship throughout our final year project. His guidance, encouragement, and dedication have been incredibly valuable in shaping our project's path. We truly appreciate his commitment to our success, and his expertise has been a crucial resource for us. We are thankful for the significant contributions that have helped us achieve our project goals. In addition, we would like to acknowledge his patience and willingness to answer our questions, no matter how challenging they may have been. Sir Junaid Akram’s mentorship has not only enriched our project but has also contributed significantly to our personal and professional growth. We are truly thankful for his mentorship and support throughout this journey.”  
Table of Contents
Chapter 1.	Introduction	16
1.1	Introduction	16
1.2	Problem Statement	17
1.3	Proposed Solution	17
1.4	Main Objectives	18
1.5	Assumptions and Constraints	18
1.5.1	Assumptions	18
1.5.2	Constraints	19
1.6	Project Scope	19
1.7	Software Life Cycle Model	19
1.7.1	Model used in Cric Craft	19
1.7.2	Why Used Agile?	20
Chapter 2.	Requirement Analysis	20
2.1	Literature Review/Existing System study	20
2.1.1	Cric-Viz	21
2.1.2	Centurian	21
2.1.3	Cricks-Lab	21
2.1.4	Cricks-HQ	21
2.1.5	Cric-Info	21
2.2	Technologies and Frameworks Used in the Sports Industry	21
2.3	Gaps and Opportunities for Cric Craft	22
2.4	Stakeholders List	23
2.5	Requirement Elicitation	23
2.5.1	Functional Requirements	23
2.5.2	Non-Functional Requirements	31
2.5.3	Requirement Traceability Matrix	33
2.6	Use Case Description	34
2.6.1	User Registration	34
2.6.2	Login	34
2.6.3	Logout	35
2.6.4	User Account Creation	35
2.6.5	User Authentication and Password Reset	36
2.6.6	User Portal Access and Navigation	37
2.6.7	Match Selection & Filtering for Analysis	37
2.6.8	Match Scorecard and Visualizations Reporting	38
2.6.9	Over by Over and Ball by Ball Analysis	39
2.6.10	Batsman vs Bowler and Performance Analysis	40
2.6.11	Session Wise, Bowling and Partnership Analysis	41
2.6.12	Player Selection and Filtering Module:	42
2.6.13	Player Performance statistics and Graphical Analysis:	43
2.6.14	Advanced Player Analysis:	44
2.6.15	Tournament Analysis Filtration:	45
2.6.16	Tournament Analysis Reporting:	46
2.6.17	Pitch Report Analysis Filtration System:	46
2.6.18	Create and Update Pitch Report	47
2.6.19	Match Playing XI Selection Filter	48
2.6.20	Change in Match Playing XI	48
Chapter 3.	System Design	50
3.1	Use Case Diagrams	50
3.1.1	User Registration	50
3.1.2	Login	51
3.1.3	Logout	51
3.1.4	User Account Creation	52
3.1.5	User Authentication and Password Reset	53
3.1.6	User Portal Access and Navigation	54
3.1.7	Match Selection & Filtering for Analysis	55
3.1.8	Match Scorecard and Visualizations Reporting	56
3.1.9	Over by Over and Ball by Ball Analysis	57
3.1.10	Batsman vs Bowler and Performance Analysis	58
3.1.11	Session-Wise, Bowling and Partnership Analysis:	59
3.1.12	Player Selection and Filtering Module	60
3.1.13	Player Performance statistics and Graphical Analysis	61
3.1.14	Advanced Player Analysis	62
3.1.15	Tournament Analysis Filtration	63
3.1.16	Tournament Analysis Reporting	64
3.1.17	Pitch Report Analysis Filtration System	65
3.1.18	Create & Update Pitch Report	66
3.1.19	Match Playing XI Selection Filter	67
3.1.20	Change in Match Playing XI	67
3.2	Activity Diagram	68
3.2.1	User Registration	68
3.2.2	Login	69
3.2.3	Logout	69
3.2.4	User Account Creation	70
3.2.5	User Authentication and Password Reset	71
3.2.6	User Portal and Navigation	72
3.2.7	Match Selection & Filtering for Analysis	73
3.2.8	Match Scorecard and Visualizations Reporting	74
3.2.9	Over by Over and Ball by Ball Analysis	75
3.2.10	Batsman vs Bowler and Performance Analysis	76
3.2.11	Session-Wise, Bowling and Partnership Analysis	77
3.2.12	Player Selection and Filtering Module	78
3.2.13	Player Performance Statistics and Graphical Analysis	79
3.2.14	Advanced Player Analysis	80
3.2.15	Tournament Analysis Filtration	81
3.2.16	Tournament Analysis Reporting	82
3.2.17	Pitch Report Analysis Filtration System	83
3.2.18	Create & Update Pitch Report	84
3.2.19	Match Playing XI Selection Filter	85
3.2.20	Change in Match Playing XI	86
3.3	Sequence Diagrams	87
3.3.1	User Registration	87
3.3.2	Login	88
3.3.3	Logout	89
3.3.4	User Account Creation	90
3.3.5	User Authentication and Password Reset	91
3.3.6	User Portal Access and Navigation	92
3.3.7	Match Selection & Filtering for Analysis	93
3.3.8	Match Scorecard and Visualizations Reporting	94
3.3.9	Over by Over and Ball by Ball Analysis	95
3.3.10	Batsman vs Bowler and Performance Analysis	96
3.3.11	Session-wise, Bowling and Partnership Analysis	97
3.3.12	Player Selection and Filtering Module	98
3.3.13	Player Performance statistics and Graphical Analysis	99
3.3.14	Advanced Player Analysis	100
3.3.15	Tournament Analysis Filtration	100
3.3.16	Tournament Analysis Reporting	101
3.3.17	Pitch Report Analysis Filtration System	102
3.3.18	Create & Update Pitch Report	102
3.3.19	Match Playing XI Selection Filter	103
3.3.20	Change in Match Playing XI	103
3.4	Software Architecture Diagram	104
3.5	Class Diagram	105
3.6	Database Diagram	106
3.7	Collaboration Diagrams	107
3.8	Network Diagram	108
Chapter 4.	System Testing	108
4.1	Test Case Design	108
4.1.1	User Registration	108
4.1.2	Login	109
4.1.3	Logout	109
4.1.4	User Account Creation	110
4.1.5	User Authentication and Password Reset	110
4.1.6	User Portal Access and Navigation	111
4.1.7	Match Selection & Filtering for Analysis	111
4.1.8	Match Scorecard and Visualizations Reporting	112
4.1.9	Over by Over and Ball by Ball Analysis	113
4.1.10	Batsman vs Bowling and Performance Analysis	114
4.1.11	Session Wise, Bowling and Partnership Analysis	114
4.1.12	Player Selection and Filtering Module	115
4.1.13	Player Performance Statistics and Graphical Analysis	116
4.1.14	Advanced Player Analysis	117
4.1.15	Tournament Analysis Filtration	118
4.1.16	Tournament Analysis Reporting	119
4.1.17	Pitch Report Analysis Filtration System	119
4.1.18	Create and update Pitch report	120
4.1.19	Match Playing XI Selection Filter	121
4.1.20	Change in Match Playing XI	122
4.2	System Testing	123
4.2.1	Tools	124
4.2.2	Types	124
4.2.3	Unit Testing	125
4.2.4	Integration Testing	125
4.2.5	Acceptance Testing	125
Chapter 5.	Implementation	127
5.1	Work breakdown structure	127
5.2	Team Roles and Responsibilities	128
5.3	Gantt Chart	128
5.4	Tools and Technologies	129
5.5	Implementation Details	129
5.6	Screen Shots of Prototype/System	131
5.6.1	Authentication & Authorization	131
5.6.2	Cric Craft System	132
5.7	Challenges During Implementation	158
Chapter 6.	Conclusion	158
6.1	Project Summary	158
6.2	Recommendations for Future Work	158
Chapter 7.	References	159
















List of Tables
Table ‎2.1 Comparison Table Between Existing Systems and Proposed System	22
Table ‎2.2  Stakeholders List	23
Table ‎2.3  FR-001 Signup	24
Table ‎2.4  FR-02 Login	24
Table ‎2.5  FR-03 Logout	24
Table ‎2.6  FR-04 User Account Creation	25
Table ‎2.7  FR-05 User Authentication and Password Reset	25
Table ‎2.8  FR-06 User Portal Access and Navigation	25
Table ‎2.9  FR-07 Match Selection & Filtering for Analysis	26
Table ‎2.10  FR-08 Match Scorecard and Visualization Reporting	26
Table ‎2.11  FR-09 Over by Over and Ball by Ball analysis	27
Table ‎2.12  FR-010 Batsman vs Bowler and Performance Analysis	27
Table ‎2.13  FR-011 Session-Wise, Bowling and Partnership Analysis	27
Table ‎2.14  FR-012 Player Selection and Filtering Module	28
Table ‎2.15  FR-013 Player Performance statistics and Graphical Analysis	28
Table ‎2.16  FR-014 Advanced Player Analysis	28
Table ‎2.17  FR-015 Tournament Analysis Filtration	29
Table ‎2.18  FR-016 Tournament Analysis Reporting	29
Table ‎2.19  FR-017 Pitch Report Analysis Filtration System	30
Table ‎2.20  FR-018 Create & Update Pitch Report	30
Table ‎2.21  FR-019 Match Playing XI Selection	31
Table ‎2.22  FR-020 Change in Match Playing XI	31
Table ‎2.23  NFR-001 Performance	31
Table ‎2.24  NFR-002 Security	32
Table ‎2.25  NFR-003 Reliability	32
Table ‎2.26  NFR-004 User Friendly	32
Table ‎2.27  NFR-005 Maintainability	32
Table ‎2.28  NFR-006 Recovery Time	32
Table ‎2.29  NFR-007 Availability	33
Table ‎2.30  Traceability Matrix	33
Table ‎2.31  Use Case Description-001 Signup	34
Table ‎2.32  Use Case Description-002 Login	34
Table ‎2.33  Use Case Description-003 Logout	35
Table ‎2.34  Use Case Description-004 User Account Creation	35
Table ‎2.35 Use Case Description-005 User Authentication and Password Reset	36
Table ‎2.36  Use Case Description-006 User Portal Access and Navigation	37
Table ‎2.37  Use Case Description-007 Match Selection & Filtering for Analysis	37
Table ‎2.38  Use Case Description-008 Match Scorecard and Visualizations Reporting	38
Table ‎2.39  Use Case Description-009 Over by Over and Ball by Ball Analysis	39
Table ‎2.40  Use Case Description-010 Batsman vs Bowler and Performance Analysis	40
Table ‎2.41  Use Case Description-011 Session Wise, Bowling and Partnership Analysis	41
Table ‎2.42  Use Case Description-012 Player Selection and Filtering Module	42
Table ‎2.43  Use Case Description-013 Player Performance Statistics and Graphical Analysis	43
Table ‎2.44  Use Case Description-014 Advanced Player Analysis	44
Table ‎2.45  Use Case Description-015 Tournament Analysis Filtration	45
Table ‎2.46  Use Case Description-016 Tournament Analysis Reporting	46
Table ‎2.47  Use Case Description-017 Pitch Report Analysis Filtration System	46
Table ‎2.48  Use Case Description-018 Create and Update Pitch Report	47
Table ‎2.49  Use Case Description-019 Match Playing XI Selection Filter	48
Table ‎2.50  Use Case Description-020 Change in Match Playing XI	48
Table ‎4.1  Test Case-001 Signup	108
Table ‎4.2  Test Case-002 Login	109
Table ‎4.3  Test Case-003 Logout	109
Table ‎4.4   Test Case-004 User Account Creation	110
Table ‎4.5  Test Case-005 User Authentication and Password Reset	110
Table ‎4.6   Test Case-006 User Portal Access and Navigation	111
Table ‎4.7   Test Case-007 Match Selection & Filtering for Analysis	111
Table ‎4.8   Test Case-008 Match Scorecard and Visualizations Reporting	112
Table ‎4.9   Test Case-009 Over by Over and Ball by Ball Analysis	113
Table ‎4.10   Test Case-010 Batsman vs Bowling and Performance Analysis	114
Table ‎4.11 Test Case-011  Session-wise, bowling, and partnership performances.	114
Table ‎4.12   Test Case-012 Player Selection and Filtering Module	115
Table ‎4.13  Test Case-013 Player Performance Statistics and Graphical Analysis	116
Table ‎4.14  Test Case-014 Advanced Player Analysis	117
Table ‎4.15   Test Case-015 Tournament Analysis Filtration	118
Table ‎4.16   Test Case-016 Tournament Analysis Reporting	119
Table ‎4.17   Test Case-017 Pitch Report Analysis Filtration System	119
Table ‎4.18   Test Case-018 Create and Update Pitch Report	120
Table ‎4.19   Test Case-019 Match Playing XI Selection Filter	121
Table ‎4.20   Test Case-020 Change in Match Playing XI	122
Table ‎5.1 Team Roles and Responsibilities	128
Table ‎7.1 References	159
	
List of Figures
Figure ‎1.1 Agile Model	20
Figure ‎3.1  Use Case Diagram-001 User Registration	50
Figure ‎3.2  Use Case Diagram-002 Login	51
Figure ‎3.3  Use Case Diagram-003 Logout	51
Figure ‎3.4  Use Case Diagram-004 User Account Creation	52
Figure ‎3.5  Use Case Diagram-005 User Authentication and Password Reset	53
Figure ‎3.6  Use Case Diagram-006 User Portal Access and Navigation	54
Figure ‎3.7  Use Case Diagram-007 Match Selection & Filtering for Analysis	55
Figure ‎3.8  Use Case Diagram-008 Match Scorecard and Visualizations Reporting	56
Figure ‎3.9  Use Case Diagram-009 Over by Over and Ball by Ball Analysis	57
Figure ‎3.10  Use Case Diagram-010 Batsman vs Bowler and Performance Analysis	58
Figure ‎3.11  Use Case Diagram-011 Session-wise, Bowling and Partnership Analysis	59
Figure ‎3.12  Use Case Diagram-012 Player Selection and Filtering Module	60
Figure ‎3.13  Use Case Diagram-013 Player Performance Statistics and Graphical Analysis	61
Figure ‎3.14  Use Case Diagram-014 Advanced Player Analysis	62
Figure ‎3.15  Use Case Diagram-015 Tournament Analysis Filtration	63
Figure ‎3.16  Use Case Diagram-016 Tournament Analysis Reporting	64
Figure ‎3.17  Use Case Diagram-017 Pitch Report Analysis Filtration System	65
Figure ‎3.18   Use Case Diagram-018 Create & Update Pitch Report	66
Figure ‎3.19   Use Case Diagram-018 Create & Update Pitch Report	67
Figure ‎3.20   Use Case Diagram-020 Change in Match Playing XI	67
Figure ‎3.21  Activity Diagram-001 User Registration	68
Figure ‎3.22  Activity Diagram-002 Login	69
Figure ‎3.23  Activity Diagram-003 Logout	69
Figure ‎3.24  Activity Diagram-003 User Account Creation	70
Figure ‎3.25  Activity Diagram-005 User Authentication and Password Reset	71
Figure ‎3.26  Activity Diagram-006 User Portal and Navigation	72
Figure ‎3.27  Activity Diagram-007 Match Selection & Filtering for Analysis	73
Figure ‎3.28  Activity Diagram-008 Match Scorecard and Visualizations Reporting	74
Figure ‎3.29  Activity Diagram-008 Match Scorecard and Visualizations Reporting	75
Figure ‎3.30  Activity Diagram-010 Batsman vs Bowler and Performance Analysis	76
Figure ‎3.31  Activity Diagram-011 Session-Wise, Bowling and Partnership Analysis	77
Figure ‎3.32  Activity Diagram-012 Player Selection and Filtering Module	78
Figure ‎3.33  Activity Diagram-013 Player Performance Statistics and Graphical Analysis	79
Figure ‎3.34   Activity Diagram-014 Advanced Player Analysis	80
Figure ‎3.35   Activity Diagram-015 Tournament Analysis Filtration	81
Figure ‎3.36   Activity Diagram-016 Tournament Analysis Reporting	82
Figure ‎3.37   Activity Diagram-017 Pitch Report Analysis Filtration System	83
Figure ‎3.38   Activity Diagram-018 Create & Update Pitch Report	84
Figure ‎3.39   Activity Diagram-019 Match Playing XI Selection Filter	85
Figure ‎3.40   Activity Diagram-020 Change in Match Playing XI	86
Figure ‎3.41 Sequence Diagram-001 User Registration	87
Figure ‎3.42 Sequence Diagram-002 Login	88
Figure ‎3.43 Sequence Diagram-003 Logout	89
Figure ‎3.44  Sequence Diagram-004 User Account Creation	90
Figure ‎3.45  Sequence Diagram-005 User Authentication and Password Reset	91
Figure ‎3.46  Sequence Diagram-006 User Portal Access and Navigation	92
Figure ‎3.47  Sequence Diagram-007 Match Selection & Filtering for Analysis	93
Figure ‎3.48  Sequence Diagram-008 Match Scorecard and Visualizations Reporting	94
Figure ‎3.49 Sequence Diagram-009 Over by Over and Ball by Ball Analysis	95
Figure ‎3.50 Sequence Diagram-010 Batsman vs Bowler and Performance Analysis	96
Figure ‎3.51 Sequence Diagram-011 Session-wise, Bowling and Partnership Analysis	97
Figure ‎3.52 Sequence Diagram-012 Player Selection and Filtering Module	98
Figure ‎3.53 Sequence Diagram-013 Player Performance statistics and Graphical Analysis	99
Figure ‎3.54   Sequence Diagram-014 Advanced Player Analysis	100
Figure ‎3.55    Sequence Diagram-015 Tournament Analysis Filtration	100
Figure ‎3.56   Sequence Diagram-016 Tournament Analysis Reporting	101
Figure ‎3.57   Sequence Diagram-017 Pitch Report Analysis Filtration System	102
Figure ‎3.58   Sequence Diagram-018 Create & Update Pitch Report	102
Figure ‎3.59   Sequence Diagram-019 Match Playing XI Selection Filter	103
Figure ‎3.60   Sequence Diagram-020 Change in Match Playing XI	103
Figure ‎3.61  Software Architecture Diagram	104
Figure ‎3.62  Class Diagram	105
Figure ‎3.63   Database Diagram	106
Figure ‎3.64   Collaboration Diagram	107
Figure ‎3.65   Network Diagram	108
Figure ‎4.1 System Testing Process	124
Figure ‎5.1  Work Breakdown Structure (WBS)	127
Figure ‎5.2   Gantt Chart	128
Figure ‎5.3 Sign in as Admin	131
Figure ‎5.4 Sign in as User	131
Figure ‎5.5 Admin Dashboard	132
Figure ‎5.6 Credentials Form	132
Figure ‎5.7 Personal Information Form	133
Figure ‎5.8 Home Page for Admin/users	133
Figure ‎5.9 Filter for Match Analysis	134
Figure ‎5.10  Match Analysis Reports	134
Figure ‎5.11  Score Card Report/1st inning/Batting	135
Figure ‎5.12   Score Card Report/1st inning/Extras/Fall of Wickets/Bowling	135
Figure ‎5.13  Score Card Report/2nd inning/Batting	136
Figure ‎5.14 Score Card Report/2nd inning/Extras/Fall of Wickets/Bowling	136
Figure ‎5.15 Batting Graphics Stats	137
Figure ‎5.16 Batting Graphics /Pitch map/Beehive/Grids	137
Figure ‎5.17 Wagon Wheel	138
Figure ‎5.18 Inning Graphical Stats for Match	138
Figure ‎5.19 Bowling Graphic Stats	139
Figure ‎5.20 Over by Over Analysis	139
Figure ‎5.21  Ball by Ball Analysis	140
Figure ‎5.22 Video Module Ball by Ball Analysis	140
Figure ‎5.23 Edit Ball by Ball data	141
Figure ‎5.24 Batsman vs Bowler Analysis	141
Figure ‎5.25  Match Batting Statistics/Inning wise	142
Figure ‎5.26 Match Batting Statistics/Day wise	142
Figure ‎5.27 Match Batting Statistics/Session Wise	143
Figure ‎5.28  Match Bowling Statistics/Inning wise	143
Figure ‎5.29 Match Bowling Statistics/Day wise	144
Figure ‎5.30 Match Bowling Statistics/Session wise	144
Figure ‎5.31  Shot Type Report	145
Figure ‎5.32  Feet Type Report	145
Figure ‎5.33  Dot Ball Sequence	146
Figure ‎5.34  Batter Day Session Report	146
Figure ‎5.35 Batter Day Session Report / Sessions	147
Figure ‎5.36 Batter Day Morning Session Report	147
Figure ‎5.37  Bowler Day Session Report	148
Figure ‎5.38 Bowler Day Session Report / Sessions	148
Figure ‎5.39   Batting Over Wise Session Report	149
Figure ‎5.40 Batting Over Wise Session Report / Power Play	149
Figure ‎5.41 Batting Over Wise Session Report / Middle Over	150
Figure ‎5.42 Batting Over Wise Session Report / Death Overs	150
Figure ‎5.43 Batting Over Wise Session Report / Custom Session	151
Figure ‎5.44  Bowling Over Wise Session Report /Power Play	151
Figure ‎5.45 Bowling Over Wise Session Report / Middle Over	152
Figure ‎5.46 Bowling Over Wise Session Report / Death Over	152
Figure ‎5.47 Bowling Over Wise Session Report / Custom Session	153
Figure ‎5.48   Bowling Category Stats	153
Figure ‎5.49   Bowling Spell Wise Report	154
Figure ‎5.50 Bowling Spell Wise Report / Data	154
Figure ‎5.51   Batting Partnership	155
Figure ‎5.52   Bowling Partnership	155
Figure ‎5.53   Video Center	156
Figure ‎5.54   Highlight of Match	156
Figure ‎5.55   Advance Filter in Video Center	157
Figure ‎5.56 Favourite Video/Pages Module	157



















Chapter 1.	Introduction
1.1	Introduction

Cricket, a sport entrenched so deeply into the culture of Pakistan, has advanced with the running of time, especially in the most recent tech-savvy era. However, technology and tools for performance analysis and systems like Centurion [1] for improvement are either not available or too expensive for local clubs, academies, and emerging players. This is certainly surprising, especially when a different style of analysis is adopted in international cricket. There lies a wide gap at the grassroots level in Pakistan, where conventional methods of evaluation are still in the repository of most of the performance analysis in this country.
The motivation behind this project comes from observing how different cricketing nations use advanced statistical tools, live graphical analysis, and instant performance insights during matches to support their players. Watching these systems in action and seeing how their players benefit from detailed feedback highlighted the gap that exists in Pakistan, where most platforms still focus only on basic scoring and simple scorecards. Through on-ground surveys, discussions with players, coaches, and staff at various levels—club, academy, and regional cricket—it became clear that there is a strong need for a system that goes beyond recording runs and wickets. Many players expressed frustration about not having access to their performance videos, pitch maps, or shot analysis, while coaches shared the difficulty of manually tracking every player’s progress. These experiences created a strong motivation to develop a platform that actually solves the real problems faced in Pakistan’s cricketing circuit. The significance of this project lies in its ability to introduce structured, visual, and meaningful performance analysis to a system that has, until now, remained limited to basic scoring. This project aims to make modern cricket analysis accessible to everyone in Pakistan, not just to national or elite teams, and to support the long-term improvement of players at all levels.
In such contexts, our Cricket Analysis System (Cric-Craft) has emerged as a disrupting solution intended to foster a change of cricket performance analysis, interpretational understanding, and subsequent improvement according to A. Khan et al. [2] to every level of cricket in Pakistan. Herein lies the primary need for low-price, all-encompassing analytic tools to be available for all categories from amateurs to specialist clubs. The cricket analytics landscape differs greatly at professional and grassroots levels in Pakistan [3] (Emerging India Analytics, 2024). While professional teams and international players enjoy access to very sophisticated analysis tools, extended performance metrics, and very detailed video analysis systems like Cric Viz [4], local clubs, academies, and the budding players, despite difficulties, continue with very simplistic scorekeeping and subjective observations with little or no technological backing for enabling a data-driven decision-making process.
The mismatch in capabilities makes life tough for grassroots players. Players do not have any reasonable means of access to their performance metrics on a systematic basis, let alone give structured data feedback for improvement. A coach can spend hours picking statistics manually for the players and providing a little focused assessment, as discussed by H. G et al. [5] in their paper on performance analysis of cricketers." Vestly et al. [6] stressed the problem that Cricket academies and clubs have difficulties in retaining their statistics and managing necessary development for players and methodologies of training depending on the insights from analytically derived concepts. The resulting dichotomy has far-reaching effects on the identification of talent, processes of player selection, and the entire quality of cricket training and development schemes in Pakistan, as highlighted by Raajesh et al. [7]. S. K. Sharma. [8] stressed the issue of contemporary market problems having built-in rigidity due to the price mechanism prohibiting income flow into the local institutions and, therefore, creating unnecessary hurdles towards modern cricket analytical tools being pursued.
Cric-Craft is expected to bring much-needed structure, clarity, and accessibility to performance evaluation in Pakistan’s cricket environment. With this system in place, players will finally be able to review their match statistics, performance trends, and video clips in a clear and consistent manner. Coaches will also benefit from organized and reliable data that helps them plan training sessions based on actual strengths and weaknesses instead of guesswork or scattered notes. The platform will support long-term player development by keeping a complete record of performances across matches, tournaments, and seasons. One of the major outcomes is that the learning process will become more visual and evidence-based through video synchronization and graphical reports. By reducing manual work and improving transparency, Cric-Craft aims to raise the overall standard of club, academy, and grassroots cricket, helping bridge the gap between domestic practices and the advanced analytical systems used at the international level.
This project contributes to Pakistan’s cricket setup by providing an affordable and centralized analysis system designed for local clubs, academies, and developing players. It introduces organized performance storage to prevent data loss and offers player-focused tools such as pitch maps, wagon wheels, beehives, and individual performance summaries. The system also makes video analysis easier through automatic linking of match footage to specific deliveries, giving coaches and players a clearer understanding of technical issues. Cric-Craft further brings all team, match, and tournament reports onto one platform, reducing dependence on manual recordkeeping. By making performance information more accessible and easier to interpret, the project helps support talent identification, improve training quality, and push grassroots cricket toward a more modern and analytical direction.
1.2	Problem Statement
In Pakistan, accessing detailed tournament and match results remains a challenge for both players and coaches. Players struggle to obtain their personal statistics and match videos, which are crucial for evaluating performances and making improvements. Unlike India, where cricket analysis systems are more advanced, Pakistan lacks a sophisticated platform that provides real-time performance insights. Cric-Craft aims to bridge this gap by offering a comprehensive, real-time cricket analysis system tailored for both players and coaches. It provides instant access to match statistics, player performance breakdowns, and match videos, all in one centralized platform. With interactive visualizations, personalized performance reports, and historical data tracking, Cric-Craft enables users to make data-driven decisions to enhance their gameplay. By offering advanced analytics and an intuitive interface, Cric-Craft is not just improving individual player performance but also setting a new benchmark for cricket analysis in Pakistan.
1.3	Proposed Solution

To address the ongoing difficulties players and coaches face when attempting to access match results, personal statistics, and performance videos, the proposed solution offers a centralized and structured cricket analysis platform designed specifically for the needs of Pakistan's cricketing environment. The main objective is to replace scattered, inconsistent, and manually collected performance data with a single system that automatically gathers, processes, and presents match insights in a comprehensible, pertinent, and helpful manner.
The approach involves developing an integrated web-based platform that organizes match data, generates visual summaries, and provides players and coaches with personalized dashboards. The methodology follows a streamlined flow: collecting match information, processing it into analytical metrics, converting those metrics into visual representations, and presenting them through an intuitive interface. This ensures that users receive both statistical and visual feedback without needing technical expertise or additional external tools. This system improves upon existing methods by offering structured data accessibility, consistent analysis, centralized video availability, and automated tracking features currently lacking in Pakistan’s cricket analysis practices.
The proposed solution remains feasible by making use of reliable frameworks and established methodologies for data processing, visualization, and web development. Without diving into excessive technical details, the platform is designed to incorporate appropriate tools such as data storage systems, graphical rendering libraries, and backend processing algorithms that support real-time access and long-term scalability. These components ensure that the system can handle multiple users, large match datasets, and frequent video uploads while maintaining smooth performance.
Expected outcomes include enhanced efficiency in accessing and reviewing performance data, improved usability through personalized and easy-to-navigate dashboards, and greater scalability to support multiple teams, tournaments, and long-term player development. The system also introduces innovation by combining real-time analytics, graphical representations, and video-based evaluation in a single platform, something currently underdeveloped in the local ecosystem. By presenting a clear, logical, and achievable approach, this proposed solution effectively bridges the gap between the problem identified earlier and the detailed implementation that follows.
1.4	Main Objectives
The main purpose of this project is to design an all-around cricket analysis system that is especially tailored for producing a player performance report and all-around statistical analysis for the coaches. This may serve to strengthen the current methodologies of analysis at club, national, and academy levels here in Pakistan. It presents a gap in local solutions for competitive analysis, providing a sound tool for making improvements in the performance of both players and teams alike. Main objectives include the following.
•	Empowering the batsman with his own individual performance reports (shot type reports, technique type ...)
•	Enabling the thrower to view ball pitch and ball hit point reports of the ball that he has delivered during his performances.
•	Reports on player performance will also be available to fielders individually.
•	Coaches can view all the matches, tournaments, and players statistics as well.
•	Players will get their reports in graphical form.
•	Fishery reporting dashboard: catches data visualization.
•	Beehive displaying the ball impacts points.
•	Spider displays the points where the shots were hit on the field and the scoring areas in the wagon wheel.
•	Showing the ball hit point pitch, which is over the pitch map.
•	Serializing the match videos to the player.
•	Identifying the balls in the reference video.
1.5	Assumptions and Constraints
1.5.1	Assumptions
•	User Tech Literacy Majority of the players and coaches are familiar with using digital platforms to access match statistics, watch videos, and analyze performance data. 
•	Reliable Internet Access Users will have stable internet access to interact with the Cric-Craft platform in real-time, ensuring smooth access to match reports, video streaming, and performance tracking.
•	Personalized Insights Players and coaches prefer personalized performance insights based on match history, trends, and statistical analysis. Therefore, the system will require access to user data to generate tailored reports.
•	Cross Platform Use Users will expect Cric-Craft to work seamlessly across devices, including desktops and tablets for easy access to match data on the go.
•	Demand for Real-Time Updates Users will expect real-time updates on match statistics, player performances, and Player Statistics. The platform must consistently provide accurate and timely data to ensure a seamless user experience.
•	User Interest in Data Visualizations Players and coaches value graphical representations of performance metrics, such as Pitch maps, Beehive, Grids, Wagon Wheels, Spiders, Catch Maps and comparisons, to make data-driven decisions.
•	Moderate to High Traffic Load It is assumed that traffic will peak during major tournaments and high-profile matches. The system should be optimized to handle large volumes of users by accessing live data simultaneously.
•	User Competency with Portal Team managers, analysts, and coaches are assumed to have a basic understanding of using the Portal to Check the Stats based on Matches, Players, Tournaments, and track player performances through the Cric-Craft Portal.
1.5.2	Constraints
•	Local Network Dependency Cric-Craft operates on a local network, meaning its functionality is restricted to venues with proper network infrastructure. Any network failure during a match could impact on real-time data accessibility.
•	Data Storage and Performance Management As match statistics, player performance data, and video files accumulate, the system must efficiently manage storage and retrieval. Excessive data growth without proper optimization could slow down performance.
•	Scalability for High Traffic During major tournaments and high-profile matches, multiple users may access real-time data simultaneously. The system must be optimized to handle high loads without performance degradation.
1.6	Project Scope
The cricket analysis system should be capable of showing interesting details about players, matches, and tournaments, while also becoming more comprehensible through graphical and visualization techniques. It must synchronize match videos with the correct games and follow regulated standards within Pakistan to support the growth of cricket. The system should provide common reports related to matches, tournaments, and players, along with an application that allows players to maintain their personal statistics. It must deliver clear, accurate, and timely reports. Additionally, the use of graphics, visualizations, and video mapping to generate these reports represents one of the major methods used by students for effective learning. 
1.7	Software Life Cycle Model
The software development process includes various SDLC (Software Development Life Cycle) models that have been developed to meet specific objectives. These models outline the different stages of the process and the sequence in which they are executed.
1.7.1	Model used in Cric Craft
Since Cric Craft has well-defined requirements, the development of Cric Craft will follow the Agile Model. This iterative and flexible approach allows the team to deliver incremental improvements, enabling frequent feedback and adaptation throughout the process. With Cric Craft's clearly defined feature sets, Agile's focus on collaboration and continuous delivery ensures the system evolves based on user needs, while reducing risks and maintaining responsiveness to change. The Agile model consists of the following phases:
•	Requirement Analysis: This is the initial phase where all project requirements are gathered, documented, and analyzed. The team collaborates closely with stakeholders to understand the full scope of what the system requires, ensuring alignment with user needs and expectations.
•	System Design: Based on the requirements defined in the previous phase, the system architecture is designed. This phase involves:
o	System Architecture
o	Data Models
o	Component Interfaces
•	Implementation (Coding): In this phase, the actual coding takes place. Each module of the system is developed and tested independently before integration. Agile allows flexibility in choosing either a top-down or bottom-up approach for implementation.
•	Testing: Once the modules are integrated, they are thoroughly tested to ensure the software meets all the requirements and functions correctly. This phase includes:
o	Unit Testing
o	System Testing
o	Integration Testing
•	Deployment: After successful testing, the system is deployed. Users can now access and utilize the system's full functionality. Deployment typically occurs after each iteration, ensuring that parts of the system are ready for use early on.
•	Maintenance: In the final phase, ongoing updates, bug fixes, and enhancements are made based on user feedback and evolving requirements. Agile allows for continuous improvement, adapting to any changes that may arise during or after deployment, ensuring the system remains relevant and functional over time.
 
Figure ‎1.1 Agile Model
In figure 21, the Agile model is demonstrated representing the Software development life cycle starting from requirements, design, development, testing, deployment and review.
1.7.2	Why Used Agile?
Agile is ideal for projects with evolving or changing requirements. For Cric Craft, where features and user feedback may evolve over time, Agile’s flexibility allows continuous adaptation and iteration. Agile delivers working software incrementally, allowing Cric Craft to release features early and frequently, enabling real-world testing and faster feedback incorporation. Agile promotes regular collaboration between development teams and stakeholders. This ensures that Cric Craft stays aligned with user’s needs and priorities, adapting quickly to any changes. Agile’s iterative cycles allow Cric Craft to continuously improve, ensuring that the product evolves with ongoing feedback and refinement after each sprint.
Chapter 2.	Requirement Analysis
2.1	Literature Review/Existing System study
In the Pakistani cricket landscape, advanced analysis systems are scarce compared to international counterparts. While global platforms like Cric-Viz [4] offer sophisticated insights, their high costs make them inaccessible to local teams and academies. Domestic cricket relies on traditional, manual tracking methods, limiting data-driven decision-making. This section reviews existing cricket analysis tools, their accessibility in Pakistan, and the need for an affordable, real-time solution like Cric-Craft to bridge this gap. 
2.1.1	Cric-Viz 
Cric Viz [4] provides a comprehensive suite of cricket analysis tools, enabling teams to access detailed data on team stats, match records, tournament results, and individual player performance across different formats. Advanced query tools allow teams to analyze historical and real-time match data for strategic insights, while player performance analysis provides in-depth statistics and live player matchups. However, the system is primarily designed for international teams and requires a high annual subscription fee, making it inaccessible for domestic teams and academies in Pakistan, who cannot benefit from its advanced analytics.
2.1.2	Centurian 
Centurion [1] is a cricket analysis tool specializing in opponent analysis, player performance metrics, and a user-friendly interface for comprehensive match insights. Opponent analysis provides data-driven insights into team strategies and player matchups, while performance metrics track key player statistics and match performance trends. However, the system has certain limitations: it lacks in-depth individual player analysis needed for targeted performance improvement, and with an annual subscription cost of approximately $37,000, it remains inaccessible to budget-conscious teams.
2.1.3	Cricks-Lab 
Cricks-Lab [9] is a basic cricket analytics platform designed for match management, live scoring, and real-time updates, catering primarily to local leagues and amateur tournaments. Live scoring provides real-time match updates and score tracking, while match management simplifies the organization of fixtures, teams, and results. However, the system has notable limitations, as it lacks in-depth statistical analysis and detailed performance breakdowns, and it offers minimal graphical insight into player performance. 
2.1.4	Cricks-HQ 
Cric-HQ [10] is a cricket administration platform designed to help clubs and leagues manage data, fixtures, and player records efficiently.Custom queries and data export allow administrators to generate reports and export match data, while club and league management supports team organization, scheduling, and player registrations. However, the system has several limitations: it lacks advanced performance analysis and in-depth player insights, provides limited visualization tools for coaches and analysts, and does not offer real-time match tracking.
2.1.5	Cric-Info 
Cric-Info [11] is a globally recognized online cricket portal that provides comprehensive live scoring, match updates, and cricket-related news. Live scoring and updates offer real-time match scores from all international and domestic games, while statistical reports provide in-depth player and team statistics, historical records, and match analysis. The platform also covers off-field updates, expert analysis, and cricket-related articles. However, it does not provide team-specific performance analysis tools, lacks interactive data visualization for detailed player tracking, and is primarily focused on reporting rather than assisting teams or players in performance enhancement.
2.2	 Technologies and Frameworks Used in the Sports Industry
•	Statistical Tracking Platforms like Cric-Info [11] provide live scoring and match statistics but lack in-depth performance breakdowns tailored to individual players.
•	Advance Data Processing Tools like Cric-Viz [4] offer predictive analytics and player performance insights but are expensive, making them inaccessible for domestic teams.
•	Basic Graphical Representation Cricks-Lab [9] provides basic scoring and match tracking but lacks detailed visualizations such as grids, beehives, wagon wheels, spiders, catch maps and pitch maps.
•	Opportunity for Enhanced Visual Analytics A system integrating interactive visual tools could significantly improve player evaluation, making it easier for coaches and analysts to assess performance patterns.
2.3	Gaps and Opportunities for Cric Craft
Based on the analysis of existing cricket analysis platforms, several areas for improvement and innovation are evident:
•	Affordable In-Depth Analysis Most advanced cricket analysis tools, such as Cric Viz [4], are expensive and inaccessible for domestic teams. Cric-Craft can provide cost-effective, detailed player performance insights tailored for local teams and academies.
•	Localized Performance Tracking Current platforms focus on global cricket data but lack localized performance tracking for Pakistani domestic players. Cric-Craft can bridge this gap by offering tailored reports for players and coaches.
•	Advanced Data Visualization Tools like Cric-HQ [10] lack interactive visual analytics. Implementing features such as heatmaps, wagon wheels, and pitch maps would improve player assessment and game strategy.
•	Real Time Match Insights Existing systems provide post-match analysis but lack real-time, in-game insights. Cric-Craft can offer live performance tracking to assist coaches and players during matches.
•	User Role Management A structured role-based system for coaches, analysts, and players would streamline backend access and control, ensuring a seamless experience.
This review highlights specific improvements Cric-Craft could introduce, such as affordable in-depth analytics, real-time performance tracking, localized data, and enhanced visualization tools, making it a valuable solution for Pakistani cricket teams and academies.
Table ‎2.1 Comparison Table Between Existing Systems and Proposed System

Key Features	
Cric-Viz [4]

Centurion [1]

Cricks lab [9]

CricHQ [10]

Cricinfo [11]

Cric
Craft
Simple Interface and Efficient Design	✅
✅
✅
❌
 ✅
 ✅

Performance Analysis	✅
 ❌
❌
 ❌ 
✅
✅

Video and Data Integration	❌
 ✅
❌
❌
❌
 ✅ 

Advanced Insights and Visualizations	❌
 ✅
❌
❌
❌
✅

Player Dashboard	❌
❌
✅
❌
❌
✅

Player and Team Statistics	❌
❌
❌
 ❌ 
✅
✅

Players Personalized Reporting	❌
❌
❌
❌
❌
✅

Data Export	❌
❌
❌
✅
✅
✅

Custom Queries	❌
 ✅ 
❌
✅
 ❌ 
✅

Match Schedules and Results	❌
❌
❌
❌
  ✅
✅

Scorekeeper	 ❌ 
 ❌ 
 ✅
❌
 ❌ 
✅

2.4	Stakeholders List
Table ‎2.2  Stakeholders List
Stakeholders	Skill Set	Type of Stakeholder	Expectations	Influence	Impact
Front-End Developer	HTML, CSS, React 	Internal	To deliver a user friendly, responsive, and visually appealing interface. 	High	High
Database Developer	SQL, query optimization	Internal	Efficiently store, retrieve, manage data. 	Medium	High
UI/UX Designer	Wireframes,
Prototypes, 
Knowledge of tools like Figma, Adobe etc.	Internal	To design an intuitive, user-centric interface that delivers a seamless experience, enhances navigation, and ensures easy interaction with all features across devices.	High	High
Software Engineer	Version control (Git) and DevOps practices 	Internal	Ensure smooth performance, scalability, and bug-free operation on functionality.	High	High
Quality Assurance Engineers / Testers	Manual and automated testing, test case development, bug reporting	Internal	Ensure the app functions as expected across different scenarios.	Medium	High
Coaches & Analysts	Match Analysis, Data Interpretation	External	Access to detailed performance analytics, visual reports, and match insights to improve player strategies.	High	High
Players	General Cricket Knowledge, Performance Tracking	External	Personalized stats, improvement tracking, and easy access to performance insights for self-assessment.	High	High
2.5	Requirement Elicitation
2.5.1	Functional Requirements
In Software Engineering, functional requirement defines the scope of the project and working of the system components in a way that is feasible for both the client and the developing team. Below is the functional requirement for Cric Craft:
2.5.1.1	User Registration
Table ‎2.3  FR-001 Signup
FR01-01	The system shall enable users to register by providing their email address/ username, and password.
FR01-02	The system shall allow user to enter email in email field, username in username field, and password in password field
FR01-03	The system shall allow the user to enter any character in username field accept the white-spaces, valid email in email field, and password will match the password requirements.
FR01-04	The system shall require users to create a password that meets predefined complexity requirements such as minimum length of 8 characters, uppercase, lowercase, number, and special character
FR01-05	The system shall validate the email and username that does not exist in database during registration and if both email and username already exist show the error message that user for that email and username already exist.
FR01-06	The system shall send a verification email after user click on the registration button after successfully match every criterion to the provided email address to confirm registration.
FR01-07	The system shall allow users to complete their registration only after email verification.
FR01-08	The system shall provide an option for the user to accept the terms and conditions before completing the registration.
FR01-09	The system shall record the user information after clicking the email verification link.

2.5.1.2	Login
Table ‎2.4  FR-02 Login
FR02-01	The system shall allow users to log in using their registered email or username and password.
FR02-02	The system shall provide the username field, email field, and password field to allow user to enter the data.
FR02-03	The system shall check all the fields that user enters valid information.
FR02-04	The system shall allow user to click login button to check the login functionality.
FR02-05	The system shall show the error any of the field violate the field instruction when click the login button.
FR02-06	The system shall validate the user’s credentials against stored data after clicking the login button.
FR02-07	The system shall show the login page after unsuccessful access.
FR02-08	The system shall login user after completing the validation process such as match the user’s credentials, move to the home page and show the user information at home page.

2.5.1.3	Logout
Table ‎2.5  FR-03 Logout
FR03-01	The system allow users to log out by clicking the logout button.
FR03-02	The system shall terminate the user session upon logout.
FR03-03	The system shall redirect the user to the login page after logout.
FR03-04	The system shall remove the user information at home page after logout successfully.

2.5.1.4	User Account Creation 
Table ‎2.6  FR-04 User Account Creation 
FR04-01	The system shall provide a two-step user creation process: (1) Credentials Entry and (2) Personal Information.
FR04-02	The system shall display a progress indicator to show the user’s current step in the process.
FR04-03	The system shall provide an input field for users to enter their email address.

FR05-04	The system shall validate the email format before allowing the user to proceed.
FR04-05	The system should provide a password field with visibility toggle and strength indicator.
FR04-06	The system shall enforce password complexity rules (e.g., minimum length, uppercase, lowercase, special character).

FR04-07	The system shall allow users to select their role from predefined options (e.g., Match Analyst).
FR04-08	The system shall allow users to select a department from predefined options (e.g., Match Analysis).
FR04-09	The system shall provide a "Next" button to proceed to the personal information step.
FR04-10	The system shall display a summary of the entered credentials before final submission 
FR04-11	The system shall allow users to enter their first name and last name.
FR04-12	The system shall provide a “Create User” button to finalize the creation process.

2.5.1.5	User Authentication and Password Reset
Table ‎2.7  FR-05 User Authentication and Password Reset
FR05-01	The system shall allow users to log in using an email and a password.
FR05-02	The system shall provide a "Forgot Password?" option for admins who need to reset their passwords

FR05-03	The system shall enforce password complexity rules, requiring at least:
• A minimum of 8 characters
• At least one special character (!@#$%^&*)

FR05-04	The system shall provide an option to show or hide the entered password.
FR05-05	The system require users to confirm the new password before submission.
FR05-06	The system shall allow users to reset their password and log in with the new credentials.
2.5.1.6	User Portal Access and Navigation
Table ‎2.8  FR-06 User Portal Access and Navigation
FR06-01	The system shall display a "Go to Portal" button after a successful login.

FR06-02	Only registered users shall be able to access the portal through the "Go to Portal" button.
FR06-03	Clicking the "Go to Portal" button shall redirect the user to the main portal page.

FR06-04	The portal shall display the following five options for analysis:
- Match Analysis
- Player Analysis
- Tournament Analysis
- Playing Eleven Analysis
- Pitch Analysis
FR06-05	The portal shall provide a search bar for users to search for relevant information.

FR06-06	Unauthorized users shall not be able to access the portal and will be redirected to the login page..

2.5.1.7	Match Selection & Filtering for Analysis
Table ‎2.9  FR-07 Match Selection & Filtering for Analysis
FR07-01	The system shall display a "Choose Matches" button in the Match Analysis module.
FR07-02	Clicking the "Choose Matches" button shall open a filter panel containing multiple filtering options.
FR07-03	The system shall provide a Date Range Filter with "From Date" and "To Date" fields.
FR07-04	The Date Range Filter shall be optional, allowing users to proceed without selecting a date range.
FR07-05	The system shall provide a Format Selection Drop-down, allowing users to select formats such as T20, ODI, and Test matches etc.
FR07-06	The Format Selection Drop-down shall be optional, allowing users to proceed without selecting a format.
FR07-07	The system shall provide a Team Selection Drop-down, allowing users to select a specific team for match filtering.
FR07-08	The Team Selection Drop-down shall be optional, allowing users to proceed without selecting a team.
FR07-09	The system shall provide a Tournament Selection Drop-down, allowing users to filter matches from a particular tournament.
FR07-10	The Tournament Selection Drop-down shall be optional, allowing users to proceed without selecting a tournament.
FR07-11	The system shall display a Select Matches Drop-down, listing available matches based on the applied filters (if any).
FR07-12	The Select Matches Drop-down shall be mandatory, requiring users to select at least one match before proceeding.
FR07-13	Upon selecting a match from the Select Matches Drop-down, the system shall load the corresponding match data.
FR07-14	The System shall load all the relevant data for the selected matches in the Match Analysis Module side bar for relevant reports.
FR07-15	If no filters (Date Range, Format, Team, Tournament) are selected, the system shall display all available matches in the Select Matches Drop-down.

2.5.1.8	Match Scorecard and Visualizations Reporting
Table ‎2.10  FR-08 Match Scorecard and Visualization Reporting
FR08-01	The system allow users to view the match scorecard, displaying both 1st and 2nd innings through respective buttons.
FR08-02	The system should provide an "Export Scorecard" feature, enabling users to download the scorecard in a suitable format.
FR08-03	The system shall include a graphics module with options for batting graphics, bowling graphics, and inning stats.
FR08-04	The system shall provide pitch map and grid pitch map visualizations with filters such as wickets, runs, and dot balls.
FR08-05	The system shall offer additional graphical reports, including beehive chart, beehive grid, wagon wheel, spider chart, and catch maps, with filtering options for runs, dots, sixes, and wickets.

2.5.1.9	Over by Over and Ball by Ball Analysis
Table ‎2.11  FR-09 Over by Over and Ball by Ball analysis
FR09-01	The system shall provide an over-by-over report, allowing users to filter data using start over and end over selection.
FR09-02	The system shall allow users to compare over-by-over performance between innings and export the report.
FR09-03	The system shall include a ball-by-ball report module with filtering options for start over, end over, and specific batsmen or bowlers.
FR09-04	The system shall provide a search bar to allow users to filter specific batsmen and display only the deliveries they faced.
FR09-05	The system shall allow users to filter multiple bowlers against a batsman to analyze performance.
FR09-06	The system shall integrate a video playback module, mapping each ball to its recorded video for detailed review.
FR09-07	The system shall provide an edit ball data option, allowing users to correct match data while storing an edit history with user details and timestamps.

2.5.1.10	Batsman vs Bowler and Performance Analysis
Table ‎2.12  FR-010 Batsman vs Bowler and Performance Analysis
FR10-01	The system shall include a batsman vs bowler statistics module, where selecting a match format is mandatory.
FR10-02	The system shall allow users to filter multiple batsmen using the search bar for comparative analysis.

FR10-03	The system shall allow users to filter multiple bowlers using the search bar for comparative analysis.

FR10-04	The system shall include a batting and bowling stats module, displaying detailed performance insights.

FR10-05	The system shall include a shot type analysis report, providing statistical data on different types of shots played.

FR10-06	The system shall include a feet movement report, displaying analysis based on foot positioning.
FR10-07	The system shall provide a dot ball sequence report, analyzing dot ball patterns within an innings.

2.5.1.11	Session-Wise, Bowling, and Partnership Analysis
Table ‎2.13  FR-011 Session-Wise, Bowling and Partnership Analysis
FR11-01	The system shall include a day and session-wise report, displaying batsman and bowler performances across different sessions.
FR11-02	The system shall include an over-wise session report, analyzing overs in different session periods for both batting and bowling.
FR11-03	The system shall provide a bowling report module, where users can filter reports based on different bowling categories.
FR11-04	The system shall include a bowler spell-wise report, displaying performance across different bowling spells.
FR11-05	The system shall include a batting partnership analysis, allowing users to compare partnerships for both teams.
FR11-06	The system shall include a bowling partnership analysis, providing insights into how different bowlers performed in tandem.
2.5.1.12	Player Selection and Filtering Module
Table ‎2.14  FR-012 Player Selection and Filtering Module 
FR12-01	The system shall provide a "Choose Player" button that opens a filter panel for player selection.

FR12-02	The system shall require the user to select a Match Type before proceeding further.

FR12-03	Upon selecting the Match Type, the system shall display an optional Team Selection dropdown to filter players based on teams.

FR12-04	If a Player is allrounder, the system shall provide a toggle switch to switch between their batting and bowling stats.
FR12-05	The system shall categorize players into batsmen, bowlers and allrounders.

2.5.1.13	Player Performance statistics and Graphical Analysis
Table ‎2.15  FR-013 Player Performance statistics and Graphical Analysis
FR13-01	The system shall generate a statistics report based on the selected player.

FR13-02	If the player is a batsman, the report shall display performance against different bowling types including spin and pace.

FR13-03	If the player is a bowler, the report shall display performance against different batting types including right-handed batsmen and left-handed batsmen.

FR13-04	The system shall provide filters for graphical statistics, allowing users to filter data based on sixes, wickets, dots, singles, doubles, and catches.

FR13-05	If the player is an all-rounder, the system shall allow toggling between batting and bowling statistics.

FR13-06	For batting analysis, the system shall allow filtering reports based on performance against spin and pace bowlers.

FR13-07	For bowling analysis, the system shall allow filtering reports based on performance against right-handed and left-handed batsmen.

2.5.1.14	Advanced Player Analysis 
Table ‎2.16  FR-014 Advanced Player Analysis
FR14-01	The system shall allow filtering performance reports by date range (From date - To date).
FR14-02	The system shall allow filtering player performance reports by over range.

FR14-03	The system shall provide a dropdown menu under the bowling option to filter reports based on different bowling types, including pace, medium, spin, orthodox, off-spinner, leg-spinner, left-arm orthodox, left-arm unorthodox, and mystery spin.
FR14-04	The system shall allow users to filter reports against a specific bowler by selecting the bowler’s name.
FR14-05	The system shall provide a dropdown menu for place and opposition filtering, allowing users to generate reports based on selected criteria.
FR14-06	The system shall include four search-based dropdowns under place and opposition: competition, opposition team, ground, and host country, enabling users to filter reports accordingly.
FR14-07	The system shall provide a dropdown under the batting option, allowing users to filter reports based on different batting attributes.

FR14-08	The system shall include four search-based dropdowns under batting options: footwork, shot type, shot direction, and runs off bat, allowing users to generate filtered reports based on any of these selections.

FR14-09	The system shall provide an "Organize By" dropdown, enabling users to filter reports by different organizational criteria, including bowling technique, innings, shot type, feet movement, against teams, game phase (powerplay, middle overs, death overs), and match-wise filtering.

FR14-10	The system shall provide an "Export to PDF" button that enables users to export complete statistical data and graphical reports as a PDF file.

FR14-11	The system shall include an "Apply Filter" button that applies selected filters and updates the report accordingly.
FR14-12	The system shall provide a "Refresh" button that allows users to clear the selected filters and reset the report view.

2.5.1.15	Tournament Analysis Filtration
Table ‎2.17  FR-015 Tournament Analysis Filtration
FR15-01 	The system shall allow users to access the Tournament Analysis page by clicking on the "Tournament Analysis" option.

FR15-02 	The system shall provide a "Choose Matches" button that, when clicked, opens the tournament filtering options.

FR15-03	The system shall allow users to filter tournament data using a date range with "From" and "To" fields.

FR15-04	The system shall provide a dropdown menu for selecting match formats (e.g., T20, ODI, Test) to filter tournament data.

FR15-05 	The system shall provide a dropdown menu for selecting specific tournaments, allowing users to filter data based on selected tournaments.

FR15-06 	The system shall provide a dropdown menu for selecting teams, enabling users to filter tournament data based on specific teams.

FR15-07 	The system shall provide an input field for specifying the "Start Over," allowing users to filter data from a particular over in the tournament.

FR15-08 	The system shall provide an input field for specifying the "End Over," allowing users to filter data up to a particular over in the tournament.

FR15-09	The system shall provide an input field for entering the "Inning Number," allowing users to filter data for a specific inning in the tournament.

FR15-10	The system shall provide an "Apply" button that, when clicked, applies the selected filters and loads the corresponding tournament data.


2.5.1.16	Tournament Analysis Reporting
Table ‎2.18  FR-016 Tournament Analysis Reporting
FR16-01	The system shall provide a "Refresh" button to clear all selected filters and reset the reporting options.

FR16-02 	The system shall provide a "Bat vs Bowl Comparison Stats" section for analyzing batting and bowling statistics.

FR16-03	The system shall provide a "Bowler vs Batsman Type Stats" report, allowing users to compare bowler performance against different batsman types.

FR16-04	The system shall provide a "Batsman vs Bowler Stats" report for analyzing a batsman's performance against specific bowlers.

FR16-05	The system shall provide a "Tournament Stats" section containing multiple reports related to tournaments.

FR16-06	The system shall provide "Tournaments Batting Stats" to analyze the batting performance of players in selected tournaments.

FR16-07	The system shall provide "Tournaments Bowling Stats" to analyze the bowling performance of players in selected tournaments.

FR16-08	The system shall provide an "Over Wise Session Report" section that enables users to analyze performance over different sessions.

FR16-09	The system shall provide a "Bowler Over-Wise Session Report" to analyze bowler performance over user-defined over ranges.

FR16-10	The system shall provide a "Batter Over-Wise Session Report" to analyze batter performance over user-defined over ranges.

FR16-11	The system shall allow users to create custom session reports by entering a "Start Over" and "End Over" range.

FR16-12	The system shall provide multiple search bars in each report to allow users to filter by multiple batsmen or bowlers for detailed analysis.

FR16-13	The system shall apply filters dynamically and update reports accordingly.

2.5.1.17	Pitch Report Analysis Filtration System 
Table ‎2.19  FR-017 Pitch Report Analysis Filtration System
FR17-01	The system shall provide a search bar to allow users to search for specific matches.

FR17-02 	The system shall provide a "From Date" and "To Date" field to allow users to filter matches based on a date range.

FR17-03	The system shall provide a "Format" dropdown to allow users to filter matches based on different formats (e.g., Test, ODI, T20).

FR17-04 	The system shall provide a "Team" dropdown to allow users to filter matches by team.

FR17-05	The system shall provide a "Match" dropdown to allow users to select a specific match for pitch report analysis.

FR17-06	The system shall display a message prompting users to select a match to view or create a pitch report.

FR17-07 	The system shall dynamically update the available options based on user selections.

FR17-08 	The system shall ensure that users can generate pitch reports based on their selected filters.

2.5.1.18	Create & Update Pitch Report
Table ‎2.20  FR-018 Create & Update Pitch Report
FR18-01	The system shall allow users to create a new pitch report for a match after applying filters.

FR18-02 	The system shall display a table with five rows representing each day of the match.

FR18-03	The system shall include the following columns in the table: Day, Bounce Rating, Seam Movement, Bounce Consistency, Turn Amount, and Notes.

FR18-04 	The system shall provide dropdown menus for users to select values for Bounce Rating, Seam Movement, Bounce Consistency, and Turn Amount.

FR18-05 	The system shall provide a text area under the Notes column for additional observations.

FR18-06 	The system shall allow users to update existing pitch reports by modifying values in the table.

FR18-07	The system shall provide a "Create Report" button to save the entered pitch report data.

FR18-08	The system shall validate that all required fields are filled before allowing the report to be created or updated.


2.5.1.19	Match Playing XI Selection Filter
Table ‎2.21  FR-019 Match Playing XI Selection
FR19-01	The system shall allow users to filter matches before selecting the playing XI.

FR19-02 	The system shall provide a Team dropdown to filter matches by a specific team.

FR19-03	The system shall allow users to select a Format (e.g., Test, ODI, T20) from a dropdown menu.

FR19-04	The system shall provide a Competition dropdown to filter matches based on tournaments or leagues.

FR19-05	The system shall allow users to select a specific match from the available filtered matches.

FR19-06	The system shall display the filtered results dynamically based on the selected criteria.

FR19-07	Upon match selection, the system shall proceed to the Playing XI Selection interface.


2.5.1.20	Change in Match Playing XI
Table ‎2.22  FR-020 Change in Match Playing XI
FR20-01	After applying all filters (date, format, team, competition, and match), the Playing XI for both teams should be displayed.

FR20-02 	Each player in the Playing XI list should have a "Change" button next to their name.

FR20-03	Clicking the "Change" button should open a modal or popup displaying the current player’s name and a list of available bench players.

FR20-04 	The user should be able to select a bench player from the list to replace the current player in the Playing XI.

FR20-05 	Upon selecting a new player, the Playing XI list should update, reflecting the replacement.

FR20-06	The system should ensure that the replacement can only be made from the available bench players of the respective team.

FR20-07	Once all changes are made, the final Playing XI should be saved and stored accordingly.

2.5.2	Non-Functional Requirements
Non-functional requirements describe the system behavior. It represents the quality or attribute of the system. Below is the non-functional requirement for Cine-Connect:
2.5.2.1	Performance
Table ‎2.23  NFR-001 Performance
NFR01-01	The average load time of the starting page of the system must be less than 5 seconds.
NFR01-02	The average processing time taken by the system to complete a request should be less than 7 seconds.
NFR01-03	System Mean Time to Failure should not be more than 90 seconds within 24 hours of use.
NFR01-04	Average system response time should not be greater than 5 seconds
NFR01-05	Users should be able to simultaneously access the system and update the database.

2.5.2.2	Security
Table ‎2.24  NFR-002 Security
NFR02-01	The system must provide access to authorized users only that enter through login component.
NFR02-02	The system must not provide access to any user except the designated user to update the database
NFR02-03	Utilize encrypted techniques to secure the user sensitive information like password and Personal information
NFR02-04	The system should log out to the user after the 3 days when token expired.
NFR02-05	No user can view data of any other user through any report or view provided by the system.

2.5.2.3	Reliability
Table ‎2.25  NFR-003 Reliability
NFR03-01	The system should only respond to valid and authenticated feedback.
NFR03-02	The system should block the unauthorized user after too many requests.
NFR03-03	The system interface should be Simple and Clear.
NFR03-04	The system should be designed to handle errors without impacting the UX.
NFR03-05	The system should provide clear and informative error messages to the users.
NFR03-06	The system should be designed to ensure the integrity of data so that data is not corrupted.
 
2.5.2.4	User Friendly
Table ‎2.26  NFR-004 User Friendly
NFR04-01	The system must present a frequently asked questions in the form of tabs for new users.
NFR04-02	The system should be clear on its tasks to increase the performance and make it easy to use.

2.5.2.5	Maintainability
Table ‎2.27  NFR-005 Maintainability
NFR05-01	The system should be designed in a way that can be changed and updated in the future.

2.5.2.6	Recovery Time
Table ‎2.28  NFR-006 Recovery Time
NFR06-01	In case of a system crash, all the information or data should be recoverable within 60 minutes of the incident.

2.5.2.7	Availability
Table ‎2.29  NFR-007 Availability
NFR07-01	The system should be available 24/7 with minimal downtime for maintenance.

2.5.3	Requirement Traceability Matrix
ID 	Associate ID 	Requirement	Use case ID 	Test Case ID 	Status
1.		FR01	User Registration	UC ID 2.5.1	TC ID 5.5.1	Pass
2.		FR02	Login	UC ID 2.5.2	TC ID 5.5.2	Pass
3.		FR03	Logout	UC ID 2.5.3	TC ID 5.5.3	Pass
4.		FR04	User Account Creation	UC ID 2.5.4	TC ID 5.5.4	Pass
5.		FR05	User Authentication and Password Reset	UC ID 2.5.5	TC ID 5.5.5	Pass
6.		FR06	User Portal Access and Navigation	UC ID 2.5.6	TC ID 5.5.6	Pass
7.		FR07	Match Selection & Filtering for Analysis	UC ID 2.5.7	TC ID 5.5.7	Pass
8.		FR08	Match Scorecard and Visualization Reporting	UC ID 2.5.8	TC ID 5.5.8	Pass
9.		FR09	Over by Over and Ball by Ball Analysis	UC ID 2.5.9	TC ID 5.5.9	Pass
10.		FR10	Batsman vs Bowler and Performance Analysis	UC ID 2.5.10	TC ID 5.5.10	Pass
11.		FR11	Session- Wise, Bowling and Partnership Analysis	UC ID 2.5.11	TC ID 5.5.11	Pass
12.		FR12	Player Selection and Filtering Module	UC ID 2.5.12	TC ID 5.5.12	Pass
13.		FR13	Player Performance Statistics and Graphical Analysis	UC ID 2.5.13	TC ID 5.5.13	Pass
14.		FR14	Advanced Player Analysis	UC ID 2.5.14	TC ID 5.5.14	Pass
15.		FR15	Tournament Analysis Filtrations	UC ID 2.5.15	TC ID 5.5.15	Pass
16.		FR16	Tournament Analysis Reporting	UC ID 2.5.16	TC ID 5.5.16	Pass
17.		FR17	Pitch Report Analysis Filtration System	UC ID 2.5.17	TC ID 5.5.17	Pass
18.		FR18	Create and update Pitch Report	UC ID 2.5.18	TC ID 5.5.18	Pass
19.		FR19	Match Playing XI Selection Filter	UC ID 2.5.19	TC ID 5.5.19	Pass
20.		FR20	Change in Match Playing XI	UC ID 2.5.20	TC ID 5.5.20	Pass
Table ‎2.30  Traceability Matrix

2.6	Use Case Description
2.6.1	User Registration
Table ‎2.31  Use Case Description-001 Signup
Use case ID 001
Use case name User Registration
Priority High	Primary Actor Admin
Other Participating Actor None
Use Case Summary
Admin can register users into the system	Pre-condition
Admin at the Create user page of the Cric-Craft
Normal Course of Events
1.	The use case starts when the Admin clicks on the Create User button.
2.	Admin enters unique username, email, and password in the Create user form.
3.	The admin clicks on the register button.
4.	The system validates the information
5.	The system saves the user information in the database.
6.	The system shows message ‘User Registered Successfully’ on the screen
Conclusion	This use case concludes when the user is successfully registered
Post Conditions
The user registered successfully and redirected to the login page.
Implementation, constraints, and Specifications
Use case must be available to the user 24 * 7.
Use case must have proper validation responses.
Use Case Cross References
Includes
Verification	Extends
Registers manually, 	Exceptions
1.1. There is an internet error. 

2.6.2	Login
Table ‎2.32  Use Case Description-002 Login
Use case ID 002
Use case name Login
Priority High	Primary Actor User, Admin
Other Participating Actor None
Use Case Summary
Users can login through their registered email and password 	Pre-condition
Users must be registered on the system.
Normal Course of Events
1.	The use case starts when the user clicks on the Login button and selects the role.
2.	Login page shall be displayed.
3.	Users and admin enter their email and password
4.	The user clicks on login button. 
5.	The system validates the email address.
6.	The system compares the credentials with those in the database
7.	The system saves the user information in the database.
8.	The system shows message ‘User Login Successfully’ on the screen
Conclusion	This use case concludes when the user or admin is successfully logged in.
Implementation, constraints, and Specifications
Use case must be available to the user 24 * 7.
Use case must have proper validation responses.
Use Case Cross References
Includes
Authentication	Extends
Login manually, Google Login	Exceptions
1.1. There is an internet error. 

2.6.3	Logout
Table ‎2.33  Use Case Description-003 Logout
Use case ID: 003
Use case name Logout
Priority High	Primary Actor User, Admin
Other Participating Actor None
Use Case Summary
Users log out their accounts to the system. 	Pre-condition
The users must be logged into the system
Normal Course of Events	
1.	The use case starts when the user clicks on the Logout button.
2.	A confirmation message appears, “Are you sure to logout?’
3.	The user confirms the logout action.
4.	The system ends the user’s session.
5.	The system displays a message ‘User logged out successfully’ on the screen.
Conclusion	This use case concludes when the users logged out.
Post Conditions
After logout the user or admin is successfully redirected to the login screen.
Any session data related to the user or admin is cleared from the system.
Implementation, constraints, and Specifications
Use case must be available to the user 24 * 7.
Use case to ensure that no sensitive data is left on the client’s side.
Use case must prevent unauthorized access.
Use Case Cross References
Includes
Session Expire	Extends
None	Exceptions
1.1. There is an internet error. 

2.6.4	User Account Creation
Table ‎2.34  Use Case Description-004 User Account Creation
Use case ID 004
Use case name User Account Creation
Priority High	Primary Actor Admin
Other Participating Actor None
Use Case Summary
This use case allows users to create an account with 2 step-process.	Pre-condition
Admin is on the Create User Page.
Normal Course of Events
1.	The use case starts when the admin initiates the user creation process.
2.	The system displays a progress indicator showing the current step.
3.	The admin enters their email address in the provided field.
4.	The system validates the email format before allowing the user to proceed.
5.	The user enters a password, and the system displays a password strength indicator and visibility toggle.
6.	The system enforces password complexity rules (e.g., minimum length, uppercase, lowercase, special character).
7.	The admin selects their role from predefined options (e.g., Match Analyst).
8.	The admin selects their department from predefined options (e.g., Match Analysis).
9.	The admin clicks the "Next" button to proceed to the personal information step.
10.	The system displays a summary of the entered credentials before final submission.
11.	The admin enters their first name and last name in the provided fields.
12.	The admin clicks the "Create User" button to finalize the process.
13.	The system saves the user data and displays a confirmation message.
Conclusion	This use case concludes when the user is successfully created.
Post Conditions
The user is registered now user can login with the registered credentials.
Implementation, constraints, and Specifications
Use case must be available to the user 24 * 7.
System must validate all the inputs before allowing them to proceed
Use Case Cross References
Includes
Email validation, Password validation, Role selection	Extends
None	Exceptions
1.1. There is an internet error. 

2.6.5	User Authentication and Password Reset
Table ‎2.35 Use Case Description-005 User Authentication and Password Reset
Use case ID 005
Use case name User Authentication and Password Reset
Priority High	Primary Actor Admin
Other Participating Actor User
Use Case Summary
The system allows users to login using their emails/ username and password. 	Pre-condition:
The user must have an existing account in the system. The user must have access to their registered email or phone number.

Normal Course of Events
User Login
1.	The user enters email/phone and password.
2.	The system validates credentials.
3.	If valid, the user is logged in.
Forgot Password Process
4.	The admin clicks "Forgot Password?"
5.	If correct, the user sets a new password (must meet complex rules).
6.	The system updates the password, and the user logs in.
Conclusion	This use case concludes that the user successfully logs in or must reset the password.
Post Conditions
The User gains access to his portal.
The old password becomes invalid after the reset password.
Implementation, constraints, and Specifications
The Password must be 8+ characters with one special character.
Use Case Cross References
Includes
Password reset, Login verification	Extends
Google if applicable	Exceptions
1.1. There is an internet error. 

2.6.6	User Portal Access and Navigation
Table ‎2.36  Use Case Description-006 User Portal Access and Navigation
Use case ID 006
Use case name User Portal Access and Navigation
Priority High	Primary Actor User
Other Participating Actor None
Use Case Summary
Users who have successfully logged in can access the analysis portal through the "Go to Portal" button. Unauthorized users attempting to access the portal are redirected to the login.	Pre-condition
The user must be registered in the system and must be logged in. 
Normal Course of Events	Alternative Path
1.	The use case starts when the user successfully logs into the system.
2.	The system displays the "Go to Portal" button.
3.	The user clicks the "Go to Portal" button.
4.	The system redirects the user to the main portal page.
5.	The system displays the portal dashboard with the following options:
a.	Match Analysis
b.	Player Analysis
c.	Tournament Analysis
d.	Playing Eleven Analysis
e.	Pitch Analysis
6.	The system provides a search bar for users to search for relevant information.
Conclusion	This use case concludes when the user has successfully accessed the portal and when the user will redirect to login page
Post Conditions
After login the user successfully navigates to the analysis portal and unauthorized user remain restricted to login page 
Implementation, constraints, and Specifications
Only registered and logged-in users can access the portal.
The "Go to Portal" button should be visible only after a successful login.
Use Case Cross References
Includes
Login Process	Extends
User Authentication	Exceptions
1.1. In case of network issue, display “Please check your internet connection and try again”.

2.6.7	Match Selection & Filtering for Analysis
Table ‎2.37  Use Case Description-007 Match Selection & Filtering for Analysis
Use case ID 007
Use case name Match Selection & Filtering for Analysis
Priority High	Primary Actor User
Other Participating Actor Admin
Use Case Summary
Users can filter and select matches for analysis by using multiple filtering options such as date range, format, team, and tournament. The system loads relevant match data for analysis based on the selected filters.	Pre-condition
The User must have access to the Match Analysis Module.
The system must have matches data for filtering
Normal Course of Events
1.	The use case starts when the user navigates to the Match Analysis Module.
2.	The system displays the "Choose Matches" button.
3.	The user clicks the "Choose Matches" button.
4.	The system opens a filter panel with multiple filtering options:
a.	Date Range Filter (From Date to Date)
b.	Format Selection Drop-down (T20, ODI, Test, etc.)
c.	Team Selection Drop-down (Specific team selection)
d.	Tournament Selection Drop-down (Filter matches by tournament)
5.	The user optionally applies any filters.
6.	The system updates the Select Matches Drop-down based on applied filters.
7.	The user selects at least one match from the Select Matches Drop-down (mandatory step).
8.	The system loads the corresponding match data.
9.	The Match Analysis Module updates the side panel with relevant reports for the selected match(es).
Conclusion	This case concludes user successfully selects a match from the drop down and the system loads the complete data of that match. 
Post Conditions
Selected matches data loaded.
Sidebar is updated according to the selected match.
Implementation, constraints, and Specifications
The Select Matches Drop-down is mandatory.
The other filtering options (Date Range, Format, Team, Tournament) are optional.
Use Case Cross References
Includes
Match Data Filtering	Extends
Match Analysis Module	Exceptions
1.1. If there is no match data available, the system displays “No Matches Found.”
2.6.8	Match Scorecard and Visualizations Reporting
Table ‎2.38  Use Case Description-008 Match Scorecard and Visualizations Reporting
Use case ID 008
Use case name Match Scorecard and Visualizations Reporting
Priority Medium	Primary Actor User
Other Participating Actor None
Use Case Summary
Users can view match scorecards, export them, and access various graphical analysis features, including batting and bowling graphics, pitch maps, and additional statistical visualizations.	Pre-condition:
User must have access to Match Analysis Module
The system must have the required Match Data.
Normal Course of Events
1.	The use case starts when the user navigates to the Match Analysis Module.
2.	The system displays 1st Innings and 2nd Innings buttons for scorecard selection.
3.	The user clicks on the desired innings button to view the corresponding scorecard.
4.	The system loads and displays the scorecard for the selected innings.
5.	The system provides an "Export Scorecard" button.
6.	The user clicks on "Export Scorecard" to download the scorecard in a suitable format.
7.	The system provides a Graphical Analysis Module with the following options:
•	Batting Graphics
•	Bowling Graphics
•	Innings Stats
8.	The user selects any graphical analysis option.
9.	The system loads the corresponding graphical report.
10.	The system provides Pitch Map and Grid Pitch Map with filters (e.g., wickets, runs, dot balls).
11.	The user applies desired filters to refine the visualization.
12.	The system provides additional reports including:
•	Beehive Chart
•	Beehive Grid
•	Wagon Wheel
•	Spider Chart
•	Catch Maps
13.	The user selects a graphical report and applies relevant filters (e.g., runs, dots, sixes, wickets).
14.	The system updates the graphical report based on the applied filters.
Post Conditions
The selected scorecard or graphical analysis is displayed to the user.
If exported, the scorecard is downloaded in the chosen format.
Implementation, constraints, and Specifications
The scorecard must display both 1st and 2nd innings separately.
Filters for graphical reports must allow runs, dots, sixes, and wickets selection.
Use Case Cross References
Includes
Scorecard Display, Graphical Reports	Extends
Match Analysis Module	Exceptions
1.1. If match data not available the system displays 
“No match data available. Please try again”


2.6.9	Over by Over and Ball by Ball Analysis
Table ‎2.39  Use Case Description-009 Over by Over and Ball by Ball Analysis
Use case ID 009
Use case name Over by Over and Ball by Ball Analysis
Priority High	Primary Actor User
Other Participating Actor None
Use Case Summary
The system provides detailed over by over and ball by ball reports, allowing users to filter and analyze performance based on various reports. Users are allowed to compare innings, export reports, search for specific batsman with multiple selection at a time and access playback video of each ball if available.	Pre-condition
User must Select a match.
Over by over and ball by ball data must be available
The video against each ball must be there or map ( if applicable)
 

Normal Course of Events
1.	The use case starts when the user navigates to the Over-by-Over Report Module.
2.	The system displays a Start Over and End Over selection filter.
3.	The user selects the desired over range for filtering.
4.	The system loads and displays over-by-over performance data.
5.	The system provides an "Export Report" option.
6.	The user clicks "Export Report" to download the over-by-over analysis in a suitable format.
7.	The user selects the Compare Over-by-Over Performance feature.
8.	The system displays a side-by-side comparison of innings performance.
9.	The user navigates to the Ball-by-Ball Report Module.
10.	The system provides filters for Start Over, End Over, Batsman, and Bowler Selection.
11.	The user applies desired filters, and the system updates the ball-by-ball report accordingly.
12.	The system provides a Search Bar for filtering deliveries faced by a specific batsman.
13.	The user selects a batsman, and the system updates the report to display only deliveries faced by the selected player.
14.	The system provides a Multiple Bowler Filter, allowing users to analyze performance against multiple bowlers.
15.	The user selects multiple bowlers, and the system updates the analysis report accordingly.
16.	The system provides a Video Playback Module, mapping each ball to its recorded video.
17.	The user clicks on a delivery to watch its corresponding video.
18.	The system provides an Edit Ball Data feature for correcting match data.
19.	The user edits ball data, and the system saves the change with user details and timestamps for tracking.
Conclusion	This use case concludes when the user has successfully analyzed the over-by-over comparison report and ball by ball report and if needed successfully edit the ball data on spot.
Post Conditions
Over by Over and ball by ball reports are generated and displayed
The user successfully analyzes and exports the reports.
The system maps video playback of every ball and allows them to edit the ball data.
Implementation, constraints, and Specifications
The Over-by-Over Report Module must support customizable filters.
The Ball-by-Ball Report Module must allow detailed filtering for specific batsmen and bowlers.
The Video Playback Module must be integrated with ball data.
The Edit Ball Data feature must store an audit history with timestamps.

Use Case Cross References
Includes
Over-by-Over Report, Ball-by-Ball Report, Video Playback	Extends
Match Analysis Module	Exceptions
1.1. If match data is incomplete, the system displays "Match data unavailable for this selection.".
2.1. If video data is missing, the system notifies "Video playback not found for this ball."

2.6.10	  Batsman vs Bowler and Performance Analysis
Table ‎2.40  Use Case Description-010 Batsman vs Bowler and Performance Analysis
Use case ID 010
Use case name Batsman vs Bowler and Performance Analysis
Priority High	Primary Actor User
Other Participating Actor Admin
Use Case Summary
The system allows users to analyze batsman vs bowler statistics based on match format, multiple player selections, and different performance reports, including shot type, feet movement, and dot ball sequence analysis.	Pre-condition
A match must be selected for analysis.
Match format selection is mandatory.
Player statistics must be available in the database.

Normal Course of Events
1.	The use case starts when the user navigates to the Batsman vs Bowler Statistics Module.
2.	The system displays a Match Format Selection Drop-down (e.g., T20, ODI, Test).
3.	The user selects the match format (mandatory).
4.	The system provides a Search Bar for selecting multiple batsmen for analysis.
5.	The user selects one or more batsmen using the search bar.
6.	The system provides a Search Bar for selecting multiple bowlers for analysis.
7.	The user selects one or more bowlers using the search bar.
8.	The system updates the display to show comparative statistics between selected batsmen and bowlers.
9.	The system displays Batting and Bowling Stats, showing key performance metrics.
10.	The system includes a Shot Type Analysis Report, displaying statistical insights on different shots played.
11.	The user selects Shot Type Analysis, and the system updates the report accordingly.
12.	The system includes a Feet Movement Report, showing shot execution based on foot positioning.
13.	The user selects Feet Movement Analysis, and the system updates the report accordingly.
14.	The system provides a Dot Ball Sequence Report, analyzing dot ball patterns within an innings.
15.	The user selects Dot Ball Sequence Analysis, and the system updates the report accordingly.

Conclusion	This use case concludes when the user successfully Selects player and analyze their batting and bowling stats in the selected match.
Post Conditions
The user gets the Stats of more than one bowler and more than one batsman at a time.
The user successfully gets Different type of reports including Shot types, Feet movement Dot ball sequence and can filter these reports accordingly. 
Implementation, constraints, and Specifications
The Match Format Selection is mandatory before accessing any statistical reports.
The Search Bar should allow users to filter multiple batsmen and bowlers dynamically.
The Statistical Reports Module should be updated in real-time based on user selections.
Use Case Cross References
Includes
Batsman Performance Analysis, Bowler Performance Analysis	Extends
Match Analysis Module	Exceptions
2.1. In case of unavailability of stats, display “Unable to load data”.

2.6.11	  Session Wise, Bowling and Partnership Analysis
Table ‎2.41  Use Case Description-011 Session Wise, Bowling and Partnership Analysis
Use case ID 011
Use case name Session Wise, Bowling and Partnership Analysis
Priority High	Primary Actor User
Other Participating Actor None
Use Case Summary
Users can analyze batsman and bowler performances across different sessions, view over-wise reports, generate bowling performance insights, and analyze partnerships in batting and bowling	Pre-condition
User must be logged in. 
A match must be selected for analysis
Data must be available for analysis.

Normal Course of Events
1.	The use case starts when the user navigates to the Session-Wise Report Module.
2.	The system displays the Day and Session-Wise Report, showing batsman and bowler performances.
3.	The user selects a session (Morning, Afternoon, Evening).
4.	The system updates the report to display performance data for the selected session.
5.	The user accesses the Over-Wise Session Report, selects an overs range, and the system updates the data.
6.	The user navigates to the Bowling Report Module, selects a bowling category (Fast Bowling, Spin Bowling, Pace Variations), and the system updates the report accordingly.
7.	The user selects the Bowler Spell-Wise Report, choosing a spell (First Spell, Second Spell), and the system updates the report.
8.	The user accesses Batting Partnership Analysis selects a partnership (Opening Pair, Middle Order), and the system updates the data.
9.	The user selects Bowling Partnership Analysis, and the system displays insights on how different bowlers performed together.
10.	The use case ends when the user successfully views session-wise, bowling, and partnership reports.
Conclusion	This Use case concludes when the user successfully gets the Session Wise Reports, Bowling Reports and Partnership reports using selection of dynamic filters.
Post Conditions
The system successfully loads and displays session wise reports
The system generates batting and bowling partnership reports wisely.
Implementation, constraints, and Specifications
The system shall display Day, Session, and Over-Wise Reports dynamically.
The partnership analysis must allow comparisons for both batting and bowling.
Use Case Cross References
Includes
Session-Wise Report, Bowling Report, Partnership Analysis	Extends
Match Analysis Module	Exceptions
1.1. In case of data unavailability display “Failed to fetch data”

2.6.12	  Player Selection and Filtering Module:
Table ‎2.42  Use Case Description-012 Player Selection and Filtering Module
Use case ID 012
Use case name Player Selection and Filtering Module
Priority High	Primary Actor User
Other Participating Actor System
Use Case Summary
Users can filter and select players based on match type, team selection, and player categories. The system categorizes players into batsmen, bowlers, and all-rounders and provides toggles for viewing different stats.	Pre-condition 
The user must have access to the Player Selection Module.
Match type and player data must be available in the system.

Normal Course of Events
1.	The use case starts when the user clicks the "Choose Player" button.
2.	The system opens a Filter Panel for player selection.
3.	The user selects the Match Type (T20, ODI, Test).
4.	The system enables an optional Team Selection dropdown based on the selected Match Type.
5.	The user selects a Team (optional) to filter players.
6.	The system categorizes players into Batsmen, Bowlers, and All-rounders.
7.	If a player is an All-rounder, the system provides a toggle switch to switch between their Batting and Bowling Stats.
8.	The user selects a player, and the system loads detailed stats for that player.
9.	The user can click on a recommended player to navigate to their detailed player analysis page.
Conclusion	This use case concludes when the system dynamically updates the player lists based on applied filters and the user successfully filters and selects a player.
Post Conditions
The system correctly loads and displays filtered players.
The toggle switch functions correctly for All-rounder stats switching.
Implementation, constraints, and Specifications
The Match Type selection is mandatory before proceeding with team/player filtering.
The toggle switch must allow seamless switching between batting and bowling stats.
Use Case Cross References
Includes
Player Filtering and Player Analysis	Extends
Match Analysis Module	Exceptions
1.1. If player data is unavailable, the system displays "Player data is currently unavailable."
2.1. If the user tries to proceed without selecting a Match Type, the system displays "Please select a Match Type to continue."

2.6.13	  Player Performance statistics and Graphical Analysis:
Table ‎2.43  Use Case Description-013 Player Performance Statistics and Graphical Analysis
Use case ID 013
Use case name Player Performance Statistics and Graphical Analysis
Priority High	Primary Actor User
Other Participating Actor Admin
Use Case Summary
Users can generate a detailed statistics report based on a selected player's performance. The system allows filtering based on various factors, including bowling type, batting type, and graphical statistics.	Pre-condition 
The user must have selected a Player from the Player Selection Module.
The system must have statistical data available for the selected player.

Normal Course of Events
1.	The use case starts when the user selects a Player for analysis.
2.	The system generates a Statistics Report based on the player's role (Batsman, Bowler, All-rounder).
3.	If the player is a Batsman, the report displays performance against different bowling types (Spin, Pace).
4.	If the player is a Bowler, the report displays performance against different batting types (Right-handed, Left-handed Batsmen).
5.	If the player is an All-rounder, the system provides a toggle switch to switch between Batting and Bowling Stats.
6.	The system provides Graphical Statistics Filters, allowing users to refine data based on:
Sixes, Wickets, Dot Balls, Singles, Doubles, Catches
7.	For Batting Analysis, users can filter reports based on performance against Spin and Pace Bowlers.
8.	For Bowling Analysis, users can filter reports based on performance against Right-handed and Left-handed Batsmen.
9.	The system updates the report based on the applied filters.
Conclusion	This use case concludes when user successfully generates and filters the player's performance statistics and dynamically updates data based on filters.
Post Conditions
The Player statistics report is generated and displayed
The system correctly applies with graphical and performance filters.
Implementation, constraints, and Specifications
The system must allow seamless toggling for all-rounders stats.
The system must update the report according to the modification in filters.
Use Case Cross References
Includes
Player Performance Report, Graphical Analysis 	Extends
Player Analysis	Exceptions
1.1. If statistical data is missing, the system display “No data available"
2.1. If the user applies incompatible filters, the system warns "No data available for the selected filter combination

2.6.14	   Advanced Player Analysis:
Table ‎2.44  Use Case Description-014 Advanced Player Analysis
Use case ID 014
Use case name Advanced Player Analysis
Priority High	Primary Actor User
Other Participating Actor Admin, System
Use Case Summary
Users can filter player performance reports based on multiple criteria, including date range, overs, bowling and batting attributes, place, opposition, and game phase. The system dynamically updates the report based on applied filters and provides an option to export the report as a PDF.	Pre-condition:
The user must have selected player for analysis
Normal Course of Events
1.	The use case starts when the user navigates to the Player Performance Report Module.
2.	The system provides various filtering options:
Date Range Filter (From Date – To Date), Over Range Filter, Bowling Type Filter (Dropdown with pace, spin, off-spin, leg-spin, etc.), Bowler Selection (Dropdown to filter against specific bowlers), Place & Opposition Filtering (Dropdown for competition, opposition team, ground, host country), Batting Attributes Filtering (Dropdown for footwork, shot type, shot direction, runs off the bat)
3.	Organize By (Bowling technique, innings, shot type, game phase, match-wise, etc.)
4.	The user applies one or multiple filters and clicks the "Apply Filter" button.
5.	The system updates the report based on the selected filters.
6.	The system provides an "Export to PDF" button.
7.	The user clicks "Export to PDF" to download the report with selected filters.
8.	The system provides a "Refresh" button.
9.	The user clicks "Refresh" to clear all filters and reset the report view.
Conclusion	This use case concludes when the user successfully filters Player Performance Reports using various criteria user can export the complete report in pdf form 
Post Conditions
The system applies selected filters and updates the report.
The system provides an accurate PDF export of the filtered data.
Implementation, constraints, and Specifications
The filtering system must support multiple simultaneous filters.
The Export to PDF must include both statistical and graphical reports.
Use Case Cross References
Includes
Player Performance Report, Statistical Data Filtering	Extends
Player Analysis Module	Exceptions
1.1. If the system cannot retrieve the data “No data available”
2.1. If the system cannot export the pdf “Failed to export data”

2.6.15	   Tournament Analysis Filtration:
Table ‎2.45  Use Case Description-015 Tournament Analysis Filtration
Use case ID 015
Use case name Tournament Analysis Filtration
Priority High	Primary Actor User
Other Participating Actor Admin
Use Case Summary
Users can navigate to the Tournament Analysis page and filter tournament data using multiple parameters, such as date range, match format, tournament name, teams, overs, and innings. The system applies to the selected filters and updates the tournament analysis accordingly.	Pre-condition
The user must have access to tournament analysis module
Tournament data must be available for all analysis

Normal Course of Events
1.	The use case starts when the user clicks on "Tournament Analysis" in the navigation menu.
2.	The system displays the Tournament Analysis page with a "Choose Matches" button.
3.	The user clicks on "Choose Matches", and the system opens the tournament filtering options:
Date Range (From Date – To Date), Match Format (T20, ODI, Test), Tournament Selection (Dropdown to choose a specific tournament), Team Selection (Dropdown to filter by specific teams), Start Over (Input field for filtering from a particular over), End Over (Input field for filtering up to a particular over), Inning Number (Input field for filtering a specific inning)
4.	The user selects one or more filters and clicks the "Apply" button.
5.	The system processes the selected filters and updates the tournament analysis.
Conclusion	This use case concludes when the User successfully filters tournament data based on selected parameters.
Post Conditions
The system applies selected tournament filters and displays the corresponding data.
Implementation, constraints, and Specifications
The system must support multiple filtering options simultaneously.
Filters must be optional, except for match selection, which is mandatory.
Use Case Cross References
Includes
Tournament Data Filtering, Match Analysis	Extends
Tournament Analysis Module	Exceptions
1.1. If tournament data is not available Display “No data available”

2.6.16	   Tournament Analysis Reporting:
Table ‎2.46  Use Case Description-016 Tournament Analysis Reporting
Use case ID 016
Use case name Tournament Analysis Reporting
Priority High	Primary Actor User
Other Participating Actor System
Use Case Summary
Users can analyze batting, bowling, and tournament statistics using various reports. The system provides comparative statistics, session-based reports, and custom filtering for detailed performance analysis.	Pre-condition:
Users must have match and tournament data available.
Normal Course of Events
1.	The use case starts when the user navigates to the Tournament Analysis or Performance Analysis section.
2.	The system displays multiple reporting options, including:
Bat vs Bowl Comparison Stats, Bowler vs Batsman Type Stats, Batsman vs Bowler Stats
Tournament Stats (Batting and Bowling), Over-Wise Session Reports
3.	The user selects a report type to analyze specific performance data.
4.	The system provides filtering options such as:
Match Type, Tournament Selection, Team Selection, Batsman/Bowler Search Bars (to filter multiple players), Custom Over Ranges (Start Over - End Over)
5.	The user applies filters, and the system dynamically updates the report.
6.	The system provides an "Apply Filter" button to refine the analysis and a "Refresh" button to reset all filters.
7.	The user views the updated statistical report with detailed performance insights.
Conclusion	This Use case concludes when the User successfully analyzes performance statistics using various reports.
Post Conditions
The system generates filtered statistical reports based on user selections.
Implementation, constraints, and Specifications
 The system must support real-time filtering and dynamic report updates.
 The refresh button must reset all the filters.
Use Case Cross References
Includes
Tournament Filtering and Selection	Extends
Match and Session Analysis	Exceptions
1.1. If no data available System displays “Failed to fetch data”

2.6.17	   Pitch Report Analysis Filtration System:
Table ‎2.47  Use Case Description-017 Pitch Report Analysis Filtration System
Use case ID 017
Use case name Pitch Report Analysis Filtration System
Priority Medium	Primary Actor User
Other Participating Actor System
Use Case Summary
Users can filter and generate pitch reports on match details such as date, format, team and specific match selection	Pre-condition
The user must have access to the Pitch Report Analysis page.
The system must have pitch and match data available.
Normal Course of Events
1.	The use case starts when the user navigates to the Pitch Report Analysis page.
2.	The system provides filtering options, including:
Search bar for specific match searches
From Date and To Date fields for date-based filtering
Format dropdown to select Test, ODI, or T20 matches
Team dropdown to filter matches by a specific team
3.	The user selects the desired filters.
4.	The system dynamically updates available match options based on the applied filters.
5.	The system provides a Match dropdown for selecting a specific match.
6.	If no match is selected, the system displays a message prompting users to select a match.
7.	Upon selecting a match, the system generates the corresponding pitch report.
Conclusion	This use case concludes when the user Successfully generates a pitch report based on selected filters.
Post Conditions
The system provides an accurate pitch report based on the selected match.
Implementation, constraints, and Specifications
The system must support real-time filtering for pitch reports.
A match selection is mandatory before generating a pitch report.
Use Case Cross References
Includes
Match Filtering, Pitch Report Generation	Extends
Tournament and Match Analysis	Exceptions
1.1.  If match data is not available System Display “No data available”

2.6.18	   Create and Update Pitch Report
Table ‎2.48  Use Case Description-018 Create and Update Pitch Report
Use case ID 018
Use case name Create and Update Pitch Report
Priority Medium	Primary Actor User
Other Participating Actor System
Use Case Summary
Users can create a new pitch report for a selected match by filling in key pitch characteristics such as bounce rating, seam movement, bounce consistency, and turn amount. The system allows users to update existing reports and ensures data validation before saving.	Pre-condition
The user must have access to a pitch analysis module and must select the match for it .
Normal Course of Events	
1.	The use case starts when the user selects a match and applies filters for pitch analysis.
2.	The system displays a table with five rows, each representing a day of the match.
3.	The system includes the following columns in the table:
Day
Bounce Rating (Dropdown)
Seam Movement (Dropdown)
Bounce Consistency (Dropdown)
Turn Amount (Dropdown)
Notes (Text Area)
4.	The user selects values for Bounce Rating, Seam Movement, Bounce Consistency, and Turn Amount using dropdown menus.
5.	The user enters additional observations in the Notes section.
6.	The system provides a "Create Report" button to save the entered pitch report data.
7.	The system validates that all required fields are filled before allowing the report to be created or updated.
8.	If the report already exists, the user can modify values in the table to update the report.
Conclusion	This use case concludes when the user successfully creates or updates the pitch report by filling all the required fields
Post Conditions
The system saves the pitch report data and makes it accessible for future analysis.
Implementation, constraints, and Specifications
The pitch report must be tied to a specific match.
Users must complete all required fields before saving the report.
Use Case Cross References
Includes
Pitch Report creation and updating	Extends
Match Analysis	Exceptions
1.1. If match data is not available System displays “No match available”

2.6.19	   Match Playing XI Selection Filter
Table ‎2.49  Use Case Description-019 Match Playing XI Selection Filter
Use case ID 019
Use case name Match Playing XI Selection Filter
Priority Medium	Primary Actor User
Other Participating Actor System
Use Case Summary
Users can filter matches based on team, format, and competition before selecting the Playing XI. Once a match is selected, the system proceeds to the Playing XI Selection interface.	Pre-condition
The user must have access to Match Playing XI module
The Match data must be available in the system
Normal Course of Events	
1.	The use case starts when the user navigates to the match selection screen.
2.	The system provides filtering options, including:
Team Dropdown – Allows users to filter matches by a specific team.
Format Dropdown – Enables users to select a format (e.g., Test, ODI, T20).
Competition Dropdown – Lets users filter matches based on tournaments or leagues.
3.	The user applies the desired filters, and the system dynamically updates the list of available matches.
4.	The user selects a specific match from the filtered list.
5.	The system proceeds to the Playing XI Selection interface.
Conclusion	This use case concludes when the user successfully filters and selects a match before proceeding to Playing XI selection.
Post Conditions
The system ensures that only filtered matches are displayed.
The user is redirected to the Playing XI Selection interface after match selection.
Implementation, constraints, and Specifications
Filtering criteria must be applied dynamically to update match results.
The system must verify that match data is available before proceeding to Playing XI selection.
Use Case Cross References
Includes
Match Filtering and Match Playing XI Selection	Extends
Match Playing XI 	Exceptions
1.1. If match data is not available System display “No match data available” 

2.6.20	   Change in Match Playing XI
Table ‎2.50  Use Case Description-020 Change in Match Playing XI
Use case ID 020
Use case name Change in Match Playing XI
Priority Medium	Primary Actor User
Other Participating Actor System
Use Case Summary
Users can view and modify the Playing XI after applying filters. The system allows replacing players from the available bench players before finalizing the Playing XI.	Pre-condition
The user must have applied all the filters.
The Playing XI and Bench Players must be present in the system
Normal Course of Events	
1.	The use case starts when the user selects a match after applying all filters.
2.	The system displays the Playing XI for both teams.
3.	Each player in the Playing XI list has a "Change" button next to their name.
4.	The user clicks the "Change" button for a player.
5.	The system opens a modal or popup display:
The current player's name
A list of available bench players
6.	The user selects a bench player as a replacement.
7.	The system updates the Playing XI, replacing the selected player.
8.	The system ensures that the replacement is only made by the respective team's bench players.
9.	Once all changes are made, the user saves the final Playing XI.
10.	The system stores the updated Playing XI.
Conclusion	This use case concludes when the user successfully updates or modifies the playing Xi and changes are saved for future use.
Post Conditions
The Playing XI reflects all valid replacements.
The changes are saved for future reference.
Implementation, constraints, and Specifications
The system must verify that replacements are only made from the bench players of the respective team.
The final Playing XI must be saved before proceeding to match analysis.
Use Case Cross References
Includes
Match Filtering, Playing XI 	Extends
Playing XI Selection	Exceptions
1.1. If match data not available Display “No match Data available”











Chapter 3.	System Design
3.1	Use Case Diagrams
3.1.1	User Registration
 
Figure ‎3.1  Use Case Diagram-001 User Registration
Figure 3.1 is the use case of user registration for Cric craft. It shows how both users and admins can interact with the system to register either manually or through Google Signup. The system validates the provided information, checks for existing users, handles empty fields, and stores the data accordingly. Based on the outcome, the system displays a success or error message.
3.1.2	Login
 
Figure ‎3.2  Use Case Diagram-002 Login
Figure 3.2 is the use case of Login system for Cric Craft. It involves the user or admin logging in manually followed by role selection. The system validates the credentials and checks the database for authentication. If validated, the user is redirected to the main dashboard. Otherwise, appropriate error messages are displayed.
3.1.3	Logout
 
Figure ‎3.3  Use Case Diagram-003 Logout
Figure 3.3 is the use case of Logout system for Cric Craft. It shows how both users and admins can trigger the logout action either manually or through automatic session expiry. The system confirms the logout and ends the session accordingly
3.1.4	User Account Creation
 
Figure ‎3.4  Use Case Diagram-004 User Account Creation
Figure 3.4 is the use case of user account creation for Cric Craft. The admin enters an email and sets a password, and the system validates both the email format and password complexity before storing the information. The admin then selects the user’s role and fills in personal details. Success or error messages are shown based on the result of the process.
3.1.5	User Authentication and Password Reset
 
Figure ‎3.5  Use Case Diagram-005 User Authentication and Password Reset
In figure 3.5 is the use case of user authentication and Password Reset for Cric Craft. When a user forgets their password, the admin reset there Password. After validation, the admin can set a new password, which is then checked for complexity before being updated. The users can log in afterward via manual login. If the credentials are invalid, error messages are shown.
3.1.6	User Portal Access and Navigation
 
Figure ‎3.6  Use Case Diagram-006 User Portal Access and Navigation
Figure 3.6 is use case of user portal access and navigation for Cric Craft. The system first verifies whether the user is registered. Upon successful validation, the user is navigated to the main portal, which contains five key analysis options: 1. Match Analysis 2. Player Analysis 3. Tournament Analysis 4. Playing XI Analysis 5. Pitch Analysis A search bar enables users to retrieve relevant information. If the user is not registered, an error message is shown
3.1.7	Match Selection & Filtering for Analysis
 
Figure ‎3.7  Use Case Diagram-007 Match Selection & Filtering for Analysis
Figure 3.7 is the use case of Match Selection and Filtering Analysis for Cric Craft. Both users and admins interact with the system to filter match data based on criteria such as format, date range, team selection, and tournament. The system then loads and updates the data in the side panel. Two outcomes are possible: 
•	Match Found: Enables match selection. 
•	No Match Found: Displayed if filters yield no results.
3.1.8	  Match Scorecard and Visualizations Reporting
 
Figure ‎3.8  Use Case Diagram-008 Match Scorecard and Visualizations Reporting
Figure 3.8 is the use case of Match Scorecard and Visualization Reporting for Cric Craft. Users can view match scorecards, apply filters, and explore both innings using visualizations such as wagon wheels, spider charts, pitch maps, and catch maps. Users can also export the scorecard. In case of any issues, appropriate error messages are displayed.
3.1.9	  Over by Over and Ball by Ball Analysis
 
Figure ‎3.9  Use Case Diagram-009 Over by Over and Ball by Ball Analysis
Figure 3.9  is the use case of Over by Over and Ball by Ball Analysis for Cric Craft, where the user can perform detailed over-by-over and ball-by-ball match analysis. Filters vary for both types of analysis. For over-by-over analysis, the user selects the over range of both innings to compare and then exports the report. For ball-by-ball analysis, the user selects the bowler and batsman and can play video for additional details. The system also supports editing ball data, viewing edit history, and handling possible errors during analysis.
3.1.10	 Batsman vs Bowler and Performance Analysis
 
Figure ‎3.10  Use Case Diagram-010 Batsman vs Bowler and Performance Analysis
Figure 3.10 is the use case of Batsman vs Bowler and Performance Analysis for Cric Craft The user or admin interacts with the system to compare stats based on various parameters such as shot type analysis, foot movement analysis, and dot ball sequences. An error message is displayed if something goes wrong during the process.
3.1.11	 Session-Wise, Bowling and Partnership Analysis:
 
Figure ‎3.11  Use Case Diagram-011 Session-wise, Bowling and Partnership Analysis
Figure 3.11 is the use case of Session-Wise, Bowling and Partnership Analysis for Cric Craft. User can conduct session-wise analysis, bowling analysis, and evaluate batting/bowling partnerships. The system provides additional features such as viewing over-wise reports, spell-wise reports, and updating reports. Error messages are shown if any issue occurs.
3.1.12	 Player Selection and Filtering Module
 
Figure ‎3.12  Use Case Diagram-012 Player Selection and Filtering Module
Figure 3.12  is the use case of Player Selection and Filtering for Cric Craft. In which users can filter and select players based on match type and team. Users can view detailed statistics for bowlers, batsmen, or all-rounders. The system also suggests recommended players and allows updating the player list. An error message is displayed if any issue arises.
3.1.13	Player Performance statistics and Graphical Analysis
 
Figure ‎3.13  Use Case Diagram-013 Player Performance Statistics and Graphical Analysis
Figure 3.13 is the use case Player Performance statistics and Graphical Analysis for Cric Craft. In which users can view player performance statistics, including batting, bowling, and graphical reports. The system generates statistical reports based on applied filters. If an error occurs, the system displays an appropriate message.
3.1.14	 Advanced Player Analysis
 
Figure ‎3.14  Use Case Diagram-014 Advanced Player Analysis
Figure 3.14 is the use case of Advanced Player Analysis for Cric Craft. Users or admins select a player and apply filters to evaluate their performance. The system supports exporting the analysis as a PDF and refreshing reports. An error message is displayed if something goes wrong.
3.1.15	Tournament Analysis Filtration
 
Figure ‎3.15  Use Case Diagram-015 Tournament Analysis Filtration
Figure 3.15 is the use case of Tournament Analysis Filtration for Cric Craft. In which users or admins can perform tournament analysis by applying specific filters. The system displays the filtered tournament data and updates the analysis view accordingly. Error messages are shown if an issue occurs.
3.1.16	Tournament Analysis Reporting
 
Figure ‎3.16  Use Case Diagram-016 Tournament Analysis Reporting
Figure 3.16 is the use case Tournament Analysis Reporting for Cric Craft. User interacts with the system to select a report type—Over-wise Report, Session Report, or Tournament Stats Report—and then apply filters to load and update the report. An error message appears if something goes wrong.
3.1.17	Pitch Report Analysis Filtration System
 
Figure ‎3.17  Use Case Diagram-017 Pitch Report Analysis Filtration System
Figure 3.17 is the use case of Pitch Report Analysis Filtration System for Cric Craft. Users select specific matches and apply filters to view or generate pitch reports. The system processes the data accordingly and displays relevant information.
3.1.18	 Create & Update Pitch Report
 
Figure ‎3.18   Use Case Diagram-018 Create & Update Pitch Report
Figure 3.18 is the use case of Create & Update Pitch Report for Cric Craft. Users can manage and customize pitch reports by adjusting parameters such as bounce rating, turn amount, seam movement, and bounce consistency. The system validates the data, displays errors if issues occur, and allows the user to save the final report.
3.1.19	 Match Playing XI Selection Filter
 
Figure ‎3.19   Use Case Diagram-018 Create & Update Pitch Report
Figure 3.19 is the use case of Match Playing XI Selection Filter: for Cric Craft. Users can access the Playing XI interface by selecting a match and applying filters. The system updates the filtered results, verifies match data, and validates the selection. An error message is displayed if something goes wrong.
3.1.20	 Change in Match Playing XI
 
Figure ‎3.20   Use Case Diagram-020 Change in Match Playing XI
Figure 3.20 is the use case of Change in Match Playing XI for Cric Craft. Users can view available bench players, validate the team's eligibility, and confirm the changes. The system then updates the Playing XI. If an issue occurs, an error message is shown.
3.2	Activity Diagram
3.2.1	User Registration
 
Figure ‎3.21  Activity Diagram-001 User Registration
Figure 3.21 illustrates that the admin starts with Create User Page, then enters their details and submits the form. The system checks if any field is empty or if the user already exists. Based on the results, it either shows appropriate error messages or successfully saves the user data and confirms the registration.
3.2.2	    Login
 
Figure ‎3.22  Activity Diagram-002 Login
Figure 3.22 shows how a user accesses the system by entering their credentials. The system validates the email format and checks the credentials against the database. Based on the outcome, it either logs the user in, shows error messages for invalid input, or notifies if the user is already registered.
3.2.3	    Logout
 
Figure ‎3.23  Activity Diagram-003 Logout
Figure 3.23 illustrates that user logs out the system by logging out, system confirms the logout request then ends the user session by displaying the message of logging out successfully.
3.2.4	    User Account Creation
 
Figure ‎3.24  Activity Diagram-003 User Account Creation
Figure 3.24 outlines the user account creation process in Cric Craft, starting with email and password validation. After selecting a role, department, and entering personal details, the user submits the form. The system then saves the data and confirms account creation.
3.2.5	    User Authentication and Password Reset
 
Figure ‎3.25  Activity Diagram-005 User Authentication and Password Reset
Figure 3.25 illustrates that the process begins with the user entering the credentials, if any error occurs then admin will reset the password of user by clicking on reset password and create a new password. User enters the new password and if valid password is being entered. System allows users to login successfully.
3.2.6	    User Portal and Navigation
 
Figure ‎3.26  Activity Diagram-006 User Portal and Navigation
Figure 3.26 illustrates that the process begins with the user being authorized to have access to “Go to Portal” button which is when clicked navigates user to main Dashboard having five options and a Search bar.
3.2.7	    Match Selection & Filtering for Analysis
 
Figure ‎3.27  Activity Diagram-007 Match Selection & Filtering for Analysis
Figure 3.27 illustrates that the process begins when user click on Match Analysis to select matches and apply filters (optionally). System loads the filtered data, user selects at least one match and updates the side panel
3.2.8	    Match Scorecard and Visualizations Reporting
 

Figure ‎3.28  Activity Diagram-008 Match Scorecard and Visualizations Reporting
Figure 3.28 shows how users access the Match Analysis Module to view and export scorecards, explore graphical reports like batting and bowling stats, and apply filters to generate visualizations such as pitch maps and wagon wheels. The system updates reports based on selected filters.
3.2.9	    Over by Over and Ball by Ball Analysis
 

Figure ‎3.29  Activity Diagram-008 Match Scorecard and Visualizations Reporting
Figure 3.29 illustrates that users can filter and export over-wise data, compare innings, and then apply filters to analyze specific batsman and bowler performances. The system supports video playback for each ball and allows editing of ball data with timestamped user details.
3.2.10	  Batsman vs Bowler and Performance Analysis
 

Figure ‎3.30  Activity Diagram-010 Batsman vs Bowler and Performance Analysis
Figure 3.30 illustrates that users select the match format, choose batsmen and bowlers, and view comparative stats. Reports on shot type, feet movement, and dot ball sequence can be generated. The system displays analysis or a message if data is unavailable.
3.2.11	  Session-Wise, Bowling and Partnership Analysis
 

Figure ‎3.31  Activity Diagram-011 Session-Wise, Bowling and Partnership Analysis
Figure 3.31 shows how users view cricket performance data. Users select sessions and overs to update reports, choose bowling categories and spells for detailed analysis, and access batting and bowling partnership insights. If no data is available, an error message is shown; otherwise, the system displays the full set of reports.
3.2.12	  Player Selection and Filtering Module
 

Figure ‎3.32  Activity Diagram-012 Player Selection and Filtering Module
Figure 3.32 shows that process begins with user selecting players from filter panel, selecting match and team (optionally), selecting player from categorized list. The system displays detailed stats of selected player.
3.2.13	  Player Performance Statistics and Graphical Analysis
 

Figure ‎3.33  Activity Diagram-013 Player Performance Statistics and Graphical Analysis
Figure 3.33 shows how users select a player and view role-based stats. Based on whether the player is a batsman, bowler, or all-rounder, relevant performance data is displayed. Users apply graphical and performance filters, and the system updates the report. If no data matches the filters, a message is shown; otherwise, the final stats report is displayed.

3.2.14	  Advanced Player Analysis
 

Figure ‎3.34   Activity Diagram-014 Advanced Player Analysis
Figure 3.34 outlines the process of generating filtered performance reports. Users navigate to the report module, choose filters like date range, over range, bowling type, and opposition, and view the updated report. The report can be exported as a PDF; if successful, the file is downloaded, otherwise an error message appears. Users can reset the view by clearing all filters.
3.2.15	  Tournament Analysis Filtration
 

Figure ‎3.35   Activity Diagram-015 Tournament Analysis Filtration	
Figure 3.35 illustrates that the process begins with user accessing the Tournament Analysis Filtration Module to filter the tournament data by choosing match and applying filters
3.2.16	  Tournament Analysis Reporting
 

Figure ‎3.36   Activity Diagram-016 Tournament Analysis Reporting
Figure 3.36 illustrates that the process begins with user accessing the Tournament Analysis Reporting Module, selecting report type (batting, bowling and tournament) and applying filters to have updated report and view statistical report
3.2.17	  Pitch Report Analysis Filtration System
 

Figure ‎3.37   Activity Diagram-017 Pitch Report Analysis Filtration System
Figure 3.37 illustrates that the process begins with the user accessing the Pitch Report Analysis Filtration Module by applying desired filters and selecting the match to generate and view the pitch report for selected matches.
3.2.18	  Create & Update Pitch Report
 

Figure ‎3.38   Activity Diagram-018 Create & Update Pitch Report
Figure 3.38 illustrates how user enter values like bounce rating, seam movement, and turn amount for each match day. After filling in all fields and adding notes, the system validates the data. If complete, users can create or update the pitch report. The final report is stored and made accessible for future analysis.
3.2.19	  Match Playing XI Selection Filter
 
Figure ‎3.39   Activity Diagram-019 Match Playing XI Selection Filter
Figure 3.39 illustrates how users access the Match Playing XI Selection Module to apply filters and select match to have access to Match Playing XI interface
3.2.20	  Change in Match Playing XI 
 

Figure ‎3.40   Activity Diagram-020 Change in Match Playing XI
Figure 3.40 illustrates how user selects match and applies filters to replace the player for both teams either by replacing with the selected bench player or new player. System then saves and updates the Match Playing XI .
3.3	Sequence Diagrams
3.3.1	User Registration
 
Figure ‎3.41 Sequence Diagram-001 User Registration
Figure 3.41 shows how admins can interact with the system to register Users manually. The system validates the provided information, checks for existing users, handles empty fields, and stores the data accordingly. Based on the outcome, the system displays a success or error message.


3.3.2	Login
 

Figure ‎3.42 Sequence Diagram-002 Login
Figure 3.42 involves the user or admin logging in manually or through Google, followed by role selection. The system validates the credentials and checks the database for authentication. If validated, the user is redirected to the main dashboard. Otherwise, appropriate error messages are displayed.

3.3.3	Logout
 

Figure ‎3.43 Sequence Diagram-003 Logout
Figure 3.43 shows how both users and admins can trigger the logout action either manually or through automatic session expiry. The system confirms the logout and ends the session accordingly.

3.3.4	User Account Creation
 

Figure ‎3.44  Sequence Diagram-004 User Account Creation
Figure 3.44 is the sequence of user account creation for Cric Craft. The admin enters an email and sets a password, and the system validates both the email format and password complexity before storing the information. The admin then selects the user’s role and fills in personal details. Success or error messages are shown based on the result of the process.
3.3.5	User Authentication and Password Reset
 

Figure ‎3.45  Sequence Diagram-005 User Authentication and Password Reset
Figure 3.45 is the sequence of user authentication and Password Reset for Cric Craft. When a user forgets their password, the admin will reset it . After validation, the user can set a new password, which is then checked for complexity before being updated. Both users and admins can log in afterward via manual login. 
3.3.6	User Portal Access and Navigation
 

Figure ‎3.46  Sequence Diagram-006 User Portal Access and Navigation
Figure 3.46 is about sequence of user portal access and navigation for Cric Craft. The system first verifies whether the user is registered. Upon successful validation, the user is navigated to the main portal, which contains five key analysis options:
•	Match Analysis
•	Player Analysis
•	Tournament Analysis
•	Playing XI Analysis
•	Pitch-Analysis
A search bar enables users to retrieve relevant information. If the user is not registered, an error message is shown.

3.3.7	Match Selection & Filtering for Analysis
 

Figure ‎3.47  Sequence Diagram-007 Match Selection & Filtering for Analysis
Figure 3.47 is the sequence of Match Selection and Filtering Analysis for Cric Craft. Both users and admins interact with the system to filter match data based on criteria such as format, date range, team selection, and tournament. The system then loads and updates the data in the side panel. Two outcomes are possible:
•	Match Found: Enables match selection.
•	No Match Found: Displayed if filters yield no results.

3.3.8	Match Scorecard and Visualizations Reporting
 

Figure ‎3.48  Sequence Diagram-008 Match Scorecard and Visualizations Reporting
Figure 3.48 is the sequence of Match Scorecard and Visualization Reporting for Cric Craft. Users can view match scorecards, apply filters, and explore both innings using visualizations such as wagon wheels, spider charts, pitch maps, and catch maps. Users can also export the scorecard. In case of any issues, appropriate error messages are displayed.


3.3.9	Over by Over and Ball by Ball Analysis
 

Figure ‎3.49 Sequence Diagram-009 Over by Over and Ball by Ball Analysis
Figure 3.49 is the sequence of Over by Over and Ball by Ball Analysis for Cric Craft, where the user can perform detailed over-by-over and ball-by-ball match analysis. Filters vary for both types of analysis. For over-by-over analysis, the user selects the over range of both innings to compare and then exports the report. For ball-by-ball analysis, the user selects the bowler and batsman and can play video for additional details. The system also supports editing ball data, viewing edit history, and handling possible errors during analysis.

3.3.10	  Batsman vs Bowler and Performance Analysis
 
Figure ‎3.50 Sequence Diagram-010 Batsman vs Bowler and Performance Analysis
Figure 3.50 is the sequence of Batsman vs Bowler and Performance Analysis for Cric Craft The user or admin interacts with the system to compare stats based on various parameters such as shot type analysis, foot movement analysis, and dot ball sequences. An error message is displayed if something goes wrong during the process.
3.3.11	  Session-wise, Bowling and Partnership Analysis
 

Figure ‎3.51 Sequence Diagram-011 Session-wise, Bowling and Partnership Analysis
Figure 3.51 is the sequence of Session-Wise, Bowling and Partnership Analysis for Cric Craft. User can conduct session-wise analysis, bowling analysis, and evaluate batting/bowling partnerships. The system provides additional features such as viewing over-wise reports, spell-wise reports, and updating reports. Error messages are shown if any issue occurs.


3.3.12	  Player Selection and Filtering Module
 

Figure ‎3.52 Sequence Diagram-012 Player Selection and Filtering Module
Figure 3.52 is the sequence of Player Selection and Filtering for Cric Craft. In which users can filter and select players based on match type and team. Users can view detailed statistics for bowlers, batsmen, or all-rounders. The system also suggests recommended players and allows updating the player list. An error message is displayed if any issue arises.

3.3.13	  Player Performance statistics and Graphical Analysis
 

Figure ‎3.53 Sequence Diagram-013 Player Performance statistics and Graphical Analysis
Figure 3.53 is the sequence of Player Performance statistics and Graphical Analysis for Cric Craft. In which users can view player performance statistics, including batting, bowling, and graphical reports. The system generates statistical reports based on applied filters. If an error occurs, the system displays an appropriate message.

3.3.14	  Advanced Player Analysis
 

Figure ‎3.54   Sequence Diagram-014 Advanced Player Analysis
Figure 3.54 is the sequence of Advanced Player Analysis for Cric Craft. Users or admins select a player and apply filters to evaluate their performance. The system supports exporting the analysis as a PDF and refreshing reports. An error message is displayed if something goes wrong.
3.3.15	  Tournament Analysis Filtration
 

Figure ‎3.55    Sequence Diagram-015 Tournament Analysis Filtration
Figure 3.55 is the sequence of Tournament Analysis Filtration for Cric Craft. In which users or admins can perform tournament analysis by applying specific filters. The system displays the filtered tournament data and updates the analysis view accordingly. Error messages are shown if an issue occurs.
3.3.16	  Tournament Analysis Reporting
 

Figure ‎3.56   Sequence Diagram-016 Tournament Analysis Reporting
Figure 3.56 is the sequence of Tournament Analysis Reporting for Cric Craft. User interacts with the system to select a report type—Over-wise Report, Session Report, or Tournament Stats Report—and then apply filters to load and update the report. An error message appears if something goes wrong.

3.3.17	  Pitch Report Analysis Filtration System
 

Figure ‎3.57   Sequence Diagram-017 Pitch Report Analysis Filtration System
Figure 3.57 is the sequence of Pitch Report Analysis Filtration System for Cric Craft. Users select specific matches and apply filters to view or generate pitch reports. The system processes the data accordingly and displays relevant information.
3.3.18	  Create & Update Pitch Report
 

Figure ‎3.58   Sequence Diagram-018 Create & Update Pitch Report
Figure 3.58 is the sequence of Create & Update Pitch Report for Cric Craft. Users can manage and customize pitch reports by adjusting parameters such as bounce rating, turn amount, seam movement, and bounce consistency. The system validates the data, displays errors if issues occur, and allows the user to save the final report.
3.3.19	  Match Playing XI Selection Filter
 

Figure ‎3.59   Sequence Diagram-019 Match Playing XI Selection Filter
Figure 3.59 is the sequence of Match Playing XI Selection Filter for Cric Craft. Users can access the Playing XI interface by selecting a match and applying filters. The system updates the filtered results, verifies match data, and validates the selection. An error message is displayed if something goes wrong.
3.3.20	  Change in Match Playing XI
 
Figure ‎3.60   Sequence Diagram-020 Change in Match Playing XI
Figure 3.60 is the sequence of Change in Match Playing XI for Cric Craft. Users can view available bench players, validate the team's eligibility, and confirm the changes. The system then updates the Playing XI. If an issue occurs, an error message is shown.
3.4	Software Architecture Diagram
 
Figure ‎3.61  Software Architecture Diagram
Figure 3.61 shows the complete architecture of the system including Front End Layer integrated with backend layer having connection with data layer and storing the data in data storage layer and having an Api integration Layer to provide gateway for application programming interface.
Front-End Layer: The primary platform that the users of the Front-End Layer connect is a web built using React. The cloud-based system allows players, coaches and staff to use the setup from anywhere as it is available on any device.
API Integration Layer: An API Integration layer is essentially the traffic manager of a system. It bridges the front end to back end using an API Gateway and ensures that all data transits securely and efficiently from one component of the system to another.
The Backend Layer: powers the system's core functions - from managing users and processing match stats to analyzing video footage and generating reports. The Data Layer then refines this raw information, creating performance insights through tagged video sessions, visual tools like wagon wheels, and deep statistical analysis. Together, these layers transform cricket data into actionable intelligence.
The Data Storage Layer provides the foundation through three key components: an SQL database for player and match records, dedicated video storage for game footage, and analytics storage for performance reports. This efficient structure ensures seamless operation while supporting system growth and new features.
3.5	Class Diagram
 
Figure ‎3.62  Class Diagram
Figure 3.62 represents the class diagram of Cric-craft displaying the different classes like tournaments, matches, teams, users, reports, player with their stats and related. It illustrates different attributes of each class including different sort of stats their related workings and interactions between them to manage the cricket data.
3.6	Database Diagram
 
Figure ‎3.63   Database Diagram
Figure 3.63 illustrates the database diagram of Cric-Craft including core tables like teams, matches, tournaments, match scoring, players, countries, match results, clubs and specially users having their attributes and relationships between all the tables. It represents all the foreign-keys relationships in the database of Cric-Craft. It especially helps in organizing the large data of players, matches they played and especially their stats.
3.7	Collaboration Diagrams
 

Figure ‎3.64   Collaboration Diagram
Figure 3.64 demonstrates the Collaboration Diagram of Cric-Craft how the users (User and Admin) and their Interactions with various System Modules like Match Analysis module, Tournament analysis module, Player Analysis module, Pitch report Module, and how they interact with Backend and get the data for statistical analysis from Database and how they get the data and then based on that data generate all types of statistical and graphical analysis reports
 
3.8	Network Diagram
 

Figure ‎3.65   Network Diagram
Figure 3.65 demonstrates the planned processes and tasks for Cric-Craft. It represents the major phases including Planning, Db Management, Design, Analysis, Documentation and Testing. It defines all the group members, and their specific Tasks assigned to them.
Chapter 4.	System Testing
4.1	Test Case Design 
4.1.1	   User Registration
Table ‎4.1  Test Case-001 Signup
Test Case ID 001
Description	User registers through valid credentials.
Pre-Condition	The user is using the system for the first time.
Post-Condition	Users should redirect to login page.
Step	Action	Input Data	Response
1.		Enter a valid username, email, and password.	1.	Saleha
2.	saleha@gmail.com
3.	12345Q$#WR#	Registered successfully.
2.		Enter a valid username, email, and invalid password.	1.	Saleha
2.	saleha@gmail.com
3.	12345	A popup message display ‘Invalid password’.
3.	Enter a valid username, invalid email, and invalid password.	1.	Saleha
2.	invalid mail
3.	12345678	A popup message display ‘Invalid email and password.
4.		Enter an invalid username, email, and password.	1.	Saleha#123
2.	invalid mail
3.	12345678	A popup message display ‘username should be unique, invalid mail and password.

4.1.2	    Login
Table ‎4.2  Test Case-002 Login
Test Case ID 002
Description	User login through register email account.
Pre-Condition	The user is already registered in the system database.
Post-Condition	User should redirect to Home page or Dashboard.
Step	Action	Input Data	Response
1.		Enter a correct email and password.	1.	saleha@gmail.com
2.	12345Q$#WR#	Login successfully.
2.	Enter a correct email and incorrect password.	1.	saleha@gmail.com
2.	12345678	A popup message display ‘Password does not match’.
3.		Enter an incorrect email and password.	1.	saleha@gmail.cm
2.	12345678	A popup message display ‘Email and password does not match’.

4.1.3	    Logout
Table ‎4.3  Test Case-003 Logout
Test Case ID 003
Description	User logout through the system.
Pre-Condition	The user is in profile page.
Post-Condition	User should redirect to Login page
Step	Action	Input Data	Response
1.		Users click on logout button having internet connection.
	N/A	Logout successfully.
2.		Users click on logout button without internet connection.	N/A	Redirect to internet error page.
4.1.4	    User Account Creation
Table ‎4.4   Test Case-004 User Account Creation
Test Case ID 004
Description	Admin creates a user account using a 2-step process
Pre-Condition	Admin is on the "Create User" page.
Post-Condition	User is registered and can log in using the provided credentials.
Step	Action	Input Data	Response
1.		Enter valid email, password, role, dept, name	saleha@gmail.com, Saleha@123, Match Analyst, Match Analysis, Saleha Mutahar	User created successfully
2.		Enter invalid email	mutahar.mail.com	Error: Please enter a valid Email Address
3.		Enter weak password	ehtisham123	Error: Password is weak
4.		Skip role/department	—	Error: Please fill out all the fields

4.1.5	    User Authentication and Password Reset
Table ‎4.5  Test Case-005 User Authentication and Password Reset
Test Case ID 005
Description	User login and password reset by Admin
Pre-Condition	User has an existing account
Post-Condition	User logs in or resets password successfully
Step	Action	Input Data	Response
1.		Login with valid credentials	saleha@gmail.com / Saleha@123	Login successful
2.		Login with invalid credentials	mutahar@gmail.com / wrong pass	Error: Invalid email or password
3.		Forgot Password →Admin enter valid email 	ehtisham@gmail.com	Reset Successfully
4.		Enter weak new password	New Pass: ehtisham123	Error: Password is weak
5.		No internet during process	—	Error: Network error

4.1.6	    User Portal Access and Navigation
Table ‎4.6   Test Case-006 User Portal Access and Navigation
Test Case ID 006
Description	Access to analysis portal after login
Pre-Condition	User is logged in
Post-Condition	User accesses portal or is redirected to login
Step	Action	Input Data	Response
1.		Login and click "Go to Portal"	saleha@gmail.com / Saleha@123	Portal dashboard opens
2.		Use search bar	Keyword: "Ehtisham"	Relevant results displayed
3.		Try to access portal with network issue	—	Error: Please check your internet connection
4.		Login and click "Go to Portal"	saleha@gmail.com / Saleha@123	Portal dashboard opens
5.		Try to access portal without login	—	Redirected to login page
6.		Check portal options	—	Match, Player, Tournament, Playing XI, Pitch Analysis shown
7.		Use search bar	Keyword: "Ehtisham"	Relevant results displayed
8.		Try to access portal with network issue	—	Error: Please check your internet connection
9.		Login and click "Go to Portal"	saleha@gmail.com / Saleha@123	Portal dashboard opens

4.1.7	    Match Selection & Filtering for Analysis
Table ‎4.7   Test Case-007 Match Selection & Filtering for Analysis
Test Case ID 007
Description	Filter and select matches for analysis
Pre-Condition	User has access to Match Analysis Module
Post-Condition	Match data loaded and sidebar updated
Step	Action	Input Data	Response
1.		Apply filters and select match	Date: 01–03–2024 to 31–03–2024, Format: T20, Team: Pakistan, Match: IND vs PAK	Match data loaded
2.		No filter applied, select match	Match: PAK vs AUS	All matches shown, data loaded
3.		Click "Choose Matches" but no match selected	—	Error: Select the matches first
4.		Open module but no match data exists	—	Message: No Matches Found
5.		Ehtisham applies filters, selects match	Format: ODI, Match: SL vs BAN	Match data loaded


4.1.8	    Match Scorecard and Visualizations Reporting
Table ‎4.8   Test Case-008 Match Scorecard and Visualizations Reporting
Test Case ID 008
Description	Scorecard or graphics are displayed/exported
Pre-Condition	User is in Match Analysis Module and match data exists
Post-Condition	Scorecard or graphics are displayed/exported
Step	Action	Input Data	Response
1.		Click 1st Innings button	—	1st Innings scorecard displayed
2.		Click Export Scorecard	—	Scorecard downloaded
3.		Click Export Scorecard (offline mode)	—	Error: Failed to export. Please Try Again
4.		Open Bowling Graphics	Filter: wickets	Bowling chart loaded with filtered data
5.		Open Spider Chart	Filter: sixes	Spider Chart displayed
6.		Open Match Analysis (no match data)	—	Error: No match data available. Please try again
7.		Click 1st Innings button	—	1st Innings scorecard displayed
8.		Click Export Scorecard	—	Scorecard downloaded

4.1.9	    Over by Over and Ball by Ball Analysis
Table ‎4.9   Test Case-009 Over by Over and Ball by Ball Analysis
Test Case ID 009
Description	Analyze over-by-over and ball-by-ball data, compare performance, and export reports.
Pre-Condition	User has selected a match, over-by-over and ball-by-ball data is available, video is available for balls if applicable.
Post-Condition	Over-by-over and ball-by-ball reports are generated and displayed, and any video playback or data edits are managed.
Step	Action	Input Data	Response
1.		Navigate to Over-by-Over Report Module	—	Over-by-Over selection filters displayed
2.		Select Start Over and End Over range	5-10	Over-by-Over performance data displayed
3.		Click Export Report	—	Report exported in chosen format
4.		Compare Over-by-Over Performance	—	Side-by-side innings performance comparison displayed
5.		Navigate to Ball-by-Ball Report Module	—	Ball-by-Ball filters displayed
6.		Apply filters: Start Over, End Over, Batsman, Bowler	5-10, Batsman: Saleha, Bowler: Mutahar	Ball-by-Ball report updated with applied filters
7.		Search for deliveries faced by a specific batsman	Batsman: Saleha	Ball-by-Ball report filtered for Saleha’s deliveries
8.		Apply Multiple Bowler Filter	Bowler: Mutahar, Ehtisham	Report updated to analyze multiple bowlers’ performance
9.		Click on ball delivery to view video playback	Ball 3	Video for Ball 3 displayed
10.		Click on a ball with no video	Ball 5	Error: "Video not available for this ball"
11.		Edit Ball Data	Ball 3: runs, player	Ball data updated with edit history
12.		Export Report (no data)	—	Error: "No data available for export"
13.		Edit Ball Data (no permission)	Ball 3	Error: "You do not have permission to edit ball data"

4.1.10	  Batsman vs Bowling and Performance Analysis
Table ‎4.10   Test Case-010 Batsman vs Bowling and Performance Analysis
Test Case ID 010
Description	Analyze Batsman vs Bowler statistics and performance reports (Shot Type, Feet Movement, Dot Ball Sequence).
Pre-Condition	A match must be selected, and match format must be chosen. Player statistics must be available.
Post-Condition	The user successfully analyzes batting and bowling stats and accesses different performance reports.
Step	Action	Input Data	Response
1.		Navigate to Batsman vs Bowler Statistics Module	—	Match Format Selection dropdown displayed
2.		Select Match Format	Format: ODI	System updates to reflect ODI stats
3.		Click on Search Bar for batsman selection	—	Batsman search bar is displayed
4.		Select multiple batsmen	Batsman: Saleha, Ehtisham	Batsman list updated
5.		Click on Search Bar for bowler selection	—	Bowler search bar is displayed
6.		Select multiple bowlers	Bowler: Mutahar, Faisal	Bowler list updated
7.		System displays comparative stats between batsmen and bowlers	—	Batsman vs Bowler stats displayed
8.		Select Shot Type Analysis	—	Shot Type Analysis report displayed
9.		Select Feet Movement Analysis	—	Feet Movement Analysis report displayed
10.		Select Dot Ball Sequence Analysis	—	Dot Ball Sequence Analysis report displayed
11.		Attempt to view stats without selecting match format	—	Error: "Please select the format"
12.		Attempt to fetch stats for unavailable player	Player: XYZ	Error: "Unable to fetch Stats"

4.1.11	  Session Wise, Bowling and Partnership Analysis
Table ‎4.11 Test Case-011  Session-wise, bowling, and partnership performances.
Test Case ID 011
Description	Analyze session-wise, bowling, and partnership performances.
Pre-Condition	User must be logged in, a match must be selected for analysis, and data must be available.
Post-Condition	The user successfully views session-wise, bowling, and partnership reports.
Step	Action	Input Data	Response
1.	Navigate to Session-Wise Report Module	—	Day and Session-Wise Report displayed
2.	Select Session	Session: Morning	Session data updated for Morning
3.	Select Over-Wise Session Report	Over Range: 1-10	Over-wise data updated for range 1-10
4.	Navigate to Bowling Report Module	—	Bowling category options displayed
5.	Select Bowling Category	Category: Fast Bowling	Bowling report updated for Fast Bowling
6.	Select Bowler Spell-Wise Report	Spell: First Spell	Spell-wise report updated for First Spell
7.	Access Batting Partnership Analysis	Partnership: Opening Pair	Partnership data updated for Opening Pair
8.	Access Bowling Partnership Analysis	—	Bowling partnership report displayed


4.1.12	  Player Selection and Filtering Module
Table ‎4.12   Test Case-012 Player Selection and Filtering Module
Test Case ID 012
Description	Validate that the player selection and filtering module allows selection based on match type, team, and category, with toggling between stats for all-rounders.
Pre-Condition	User must have access to the Player Selection Module. Match type and player data must be available.
Post-Condition	The filtered player list is displayed. Player stats load correctly. Toggle for all-rounders works.
Step	Action	Input Data	Response
1.		Click "Choose Player" button	—	Filter panel is opened
2.		Select Match Type	T20	Team dropdown is enabled
3.		(Optional) Select Team	Team A	Player list filtered by Match Type and Team
4.		System categorizes players	—	Players grouped: Batsmen, Bowlers, All-rounders
5.		Toggle All-Rounder Stats	Select Player: All-rounder A	Toggle displays batting and bowling stats correctly
6.		Select Player	Player A	Detailed player stats are displayed
7.		Click Recommended Player	—	Redirect to detailed analysis page for selected player
8.		Skip Match Type selection	—	Error: "Please select a Match Type to continue."
9.		No players match filter	Team B, Match Type: Test	Error: "No players available for the selected criteria."
10.		Player data unavailable	—	Error: "Player data is currently unavailable."
11.		Click "Choose Player" button	—	Filter panel is opened
12.		Select Match Type	T20	Team dropdown is enabled

4.1.13	  Player Performance Statistics and Graphical Analysis
Table ‎4.13  Test Case-013 Player Performance Statistics and Graphical Analysis
Test Case ID 013
Description	Validate that users can view and filter player performance stats with graphical analysis based on selected filters.
Pre-Condition	A player must be selected. Statistical data must be available.
Post-Condition	The system displays performance stats, allows filtering, and dynamically updates reports.
Step	Action	Input Data	Response
1.		Select a Player	Player A	Statistics Report loads based on player role
2.		Player is Batsman	—	Report shows performance against Spin and Pace bowlers
3.		Player is Bowler	—	Report shows stats against Right- and Left-handed batsmen
4.		Player is All-rounder	—	Toggle switch appears for Batting/Bowling stats
5.		Use Toggle	Switch to Bowling	Bowling stats appear (if All-rounder)
6.		Apply Graphical Filter	Sixes, Dot Balls, Catches	Report updates based on selected stats
7.		Filter Batting by Bowling Type	Spin	System filters and shows relevant batting stats
8.		Filter Bowling by Batting Type	Left-handed	System filters and shows relevant bowling stats

4.1.14	  Advanced Player Analysis
Table ‎4.14  Test Case-014 Advanced Player Analysis
Test Case ID 014
Description	Validate that users can apply multiple filters to a player’s performance data and export the report as a PDF.
Pre-Condition	A player must be selected for analysis.
Post-Condition	The system displays filtered results and allows successful PDF export.
Step	Action	Input Data	Response
1.		Navigate to Player Performance Report Module	—	System loads filtering interface
2.		Apply Date Range Filter	From: 2023-01-01, To: 2023-12-31	System updates report to show only data within selected dates
3.		Apply Over Range Filter	Overs 6 to 15	Report updates to show stats in overs 6–15 only
4.		Select Bowling Type Filter	Leg-spin	System filters results for leg-spin bowlers only
5.		Apply Bowler Filter	Bowler A	Report updates to show performance vs. Bowler A
6.		Apply Place & Opposition Filter	Competition: World Cup, Team: AUS, Ground: MCG	System displays data matching all selected filters
7.		Select Batting Attribute Filter	Shot Type: Pull, Footwork: Front foot, Runs: 4+	Report updates to show relevant filtered stats
8.		Organize Report By	Shot Direction	System re-organizes stats by shot direction
9.		Apply Filter	Click "Apply Filter"	System updates report dynamically

4.1.15	  Tournament Analysis Filtration
Table ‎4.15   Test Case-015 Tournament Analysis Filtration
Test Case ID 015
Description	Verify that the user can apply multiple filters on the Tournament Analysis page to view tournament-specific performance data.
Pre-Condition	The user has access to the tournament analysis module, and tournament data exists in the system.
Post-Condition	Filtered tournament data is displayed according to user input.
Step	Action	Input Data	Response
1.		Navigate to Tournament Analysis	—	System loads Tournament Analysis page
2.	 	Click "Choose Matches"	—	Filtering options are displayed
3.		Apply Date Range Filter	From: 2023-01-01, To: 2023-12-31	Matches within the specified range are shown
4.		Apply Match Format Filter	Format: T20	Only T20 matches appear in analysis
5.		Apply Tournament Filter	Tournament: ICC World Cup 2023	Only data from the selected tournament is displayed
6.		Apply Team Filter	Team: Pakistan	Filters data to show matches played by Pakistan
7.		Input Over Range	Start Over: 10, End Over: 20	Data shown is limited to overs 10–20
8.		Select Inning Number	Inning: 2	Displays only second innings data
9.		Apply Filters	Click "Apply"	Tournament analysis is updated with selected filters
10.		Apply Filter with No Matching Data	Team: Atlantis	Error: "No tournament data available for the selected filter"
11.		No Tournament Data Exists	—	Error: "No data available"
12.		Navigate to Tournament Analysis	—	System loads Tournament Analysis page
13.		Click "Choose Matches"	—	Filtering options are displayed

4.1.16	  Tournament Analysis Reporting
Table ‎4.16   Test Case-016 Tournament Analysis Reporting
Test Case ID 016
Description	Verify that the system allows users to generate and analyze various tournament reports using filters and comparison tools.
Pre-Condition	Match and tournament data must exist in the system.
Post-Condition	The system displays filtered and accurate performance reports based on the selected criteria.
Step	Action	Input Data	Response
1.		Navigate to Tournament/Performance Analysis Section	—	System loads the report dashboard with analysis options
2.		View Available Reports	—	Options: Bat vs Bowl Stats, Bowler vs Batsman Type, Tournament Stats, Over-Wise Session Reports, etc.
3.		Select Report Type	Tournament Stats (Bowling)	Filters appear for match type, teams, players, overs, etc.
4.		Apply Match Type Filter	Match Type: ODI	Only ODI match reports are loaded
5.		Select Tournament	Tournament: Asia Cup 2023	Data is filtered by selected tournament
6.		Team Filter	Team: India	Displays tournament stats for India only
7.		Search Batsman/Bowler	Bowler: Bumrah	Stats for Bumrah are loaded
8.		Apply Over Range	Start Over: 5, End Over: 15	Report is narrowed to overs 5–15
9.		Click Apply Filter	—	System dynamically updates the report
10.		Click Refresh	—	All filters are reset to default

4.1.17	  Pitch Report Analysis Filtration System
Table ‎4.17   Test Case-017 Pitch Report Analysis Filtration System
Test Case ID 017
Description	Verify that the system allows users to filter and generate pitch reports based on match date, format, team, and selected match.
Pre-Condition	Users must have access to the Pitch Report Analysis page and pitch/match data must be available.
Post-Condition	The system generates an accurate pitch report based on selected match.
Step	Action	Input Data	Response
1.		Navigate to Pitch Report Analysis	—	System loads Pitch Report Analysis interface with filters
2.		Search Specific Match	Search: "India vs Pakistan"	Matches relevant to search query are listed
3.		Apply Date Filter	From: 01-01-2023, To: 31-12-2023	Matches within date range are displayed
4.		Select Match Format	Format: Test	Only Test matches are displayed
5.		Select Team	Team: Pakistan	Filters matches involving Pakistan
6.		View Match Dropdown	—	Match list dynamically updates based on applied filters
7.		No Match Selected	—	Message: “Please select a match to generate a pitch report.”
8.		Select Match from Dropdown	Match: IND vs PAK, 15-Aug-2023	Pitch report for selected match is generated
9.		No Matches for Filters	Format: Test, Team: Atlantis	Message: “No matches found for the selected criteria.”
10.		Data Unavailable	—	Message: “No data available” if pitch or match data is missing
11.		Navigate to Pitch Report Analysis	—	System loads Pitch Report Analysis interface with filters
12.		Search Specific Match	Search: "India vs Pakistan"	Matches relevant to search query are listed
13.		Apply Date Filter	From: 01-01-2023, To: 31-12-2023	Matches within date range are displayed
14.		Select Match Format	Format: Test	Only Test matches are displayed
15.		Select Team	Team: Pakistan	Filters matches involving Pakistan

4.1.18	  Create and update Pitch report 
Table ‎4.18   Test Case-018 Create and Update Pitch Report
Test Case ID 018
Description	Verify that users can create and update pitch reports for a selected match with required dropdown inputs and notes.
Pre-Condition	User must have access to the Pitch Analysis Module and a match must be selected.
Post-Condition	System saves the new or updated pitch report data and makes it available for future analysis.
Step	Action	Input Data	Response
1.		Select Match for Pitch Report	Match: IND vs AUS, 18-Jan-2024	System loads pitch report table with 5 rows (Day 1 to Day 5)
2.		View Table Columns	—	Columns displayed: Day, Bounce Rating, Seam Movement, Bounce Consistency, Turn Amount, Notes
3.		Select Pitch Characteristics	Bounce: Medium, Seam: High, Consistency: Low, Turn: Moderate	Fields accept dropdown input for each day
4.		Add Notes	Notes: "Pitch slowed down after Day 2"	Text field allows note entry for each day
5.		Create Pitch Report	All dropdowns selected, Notes filled	System validates and saves report
6.		Update Existing Report	Modify values in dropdowns and notes	System updates report after validation
7.		Leave Field Blank (Validation Check)	Omit Bounce Rating for Day 3	Error Message: “Please fill in all the required fields”
8.		Match Not Selected	—	Error Message: “No match available”
9.		Submit With All Fields Completed	Complete all fields for all 5 days	Message: “Pitch report saved successfully”

4.1.19	  Match Playing XI Selection Filter
Table ‎4.19   Test Case-019 Match Playing XI Selection Filter
Test Case ID 019
Description	Verify that the system allows users to filter and select matches based on team, format, and competition before proceeding to the Playing XI selection interface.
Pre-Condition	User must have access to the Match Playing XI module, and match data must be available in the system.
Post-Condition	User is redirected to the Playing XI Selection interface after selecting a match.
Step	Action	Input Data	Response
1.		Navigate to Match Selection Screen	—	System displays match selection screen with filter options (Team, Format, Competition)
2.		Apply Team Filter	Team: India	System updates match list to show matches involving India
3.		Apply Format Filter	Format: ODI	System filters match to show only ODI matches
4.		Apply Competition Filter	Competition: ICC World Cup	System filters match to show only ICC World Cup matches
5.		View Filtered Match List	—	Matches are dynamically filtered based on team, format, and competition
6.		Select a Match from Filtered List	Match: India vs Australia, 15-12-2023	System selects the match and redirects to the Playing XI Selection interface
7.		No Matches Found	Format: Test, Team: Afghanistan, Competition: T20I	System displays: “No data available”
8.		Select Invalid Match Filter Combination	Team: Pakistan, Format: Test, Competition: IPL	System displays: “No match data available”

4.1.20	  Change in Match Playing XI
Table ‎4.20   Test Case-020 Change in Match Playing XI
Test Case ID 020
Description	Verify that the system allows users to view and modify the Playing XI after applying filters and replacing players with bench players before finalizing the selection.
Pre-Condition	User must have applied all filters, and the Playing XI and Bench Players must be present in the system.
Post-Condition	The system saves and stores the updated Playing XI with all valid changes.
Step	Action	Input Data	Response
1.		Select a Match after Filters	Match: India vs Australia, 15-12-2023	System displays the Playing XI for both teams
2.		Click "Change" Button for a Player	Player: Virat Kohli	System opens a modal with the player's name and a list of available bench players
3.		Select a Bench Player for Replacement	Bench Player: Rishabh Pant	System replaces the selected player (Virat Kohli) with the selected bench player (Rishabh Pant) in the Playing XI
4.		Apply All Changes	—	System updates the Playing XI with the replacements made by the user
5.		Save Final Playing XI	—	System saves the updated Playing XI
6.		No Bench Player Available	Team: Australia, Player: Steve Smith (No bench players available)	System displays: “No player available to replace”
7.		No Match Data Available	—	System displays: “No match data available”
8.		Select a Match after Filters	Match: India vs Australia, 15-12-2023	System displays the Playing XI for both teams
9.		Click "Change" Button for a Player	Player: Virat Kohli	System opens a modal with the player's name and a list of available bench players
4.2	System Testing
System testing the type of Software testing in which the whole system testing at once. System testing tests the design of the software and its behavior. System testing checks the system to fully fulfil the functional requirements. It has both functional and non-functional testing. System Testing performed after the Integration testing. 
There are two types of System testing:
1.	Black-box testing
2.	White-box testing
Below diagram show the System Testing Process:

 
Figure ‎4.1 System Testing Process
4.2.1	Tools
1.	Selenium (Automated Browsing testing)
2.	Trello (Task distribution)
3.	Jira (Project Tracking)
4.2.2	Types
4.2.2.1	Black-box Testing
In black box testing, the functionality will be tested without looking at the internal code of the system. The whole system is tested according to the user’s point of view. Check the functionalities such as:
1.	Search the matches through match details without looking at the code logic.
2.	Perform the registration process whether it's working or not.
4.2.2.2	White-box Testing
White box testing is opposite to the black box testing. In white-box testing, focus on the internal structure of the functionality, design, and coding of the tested system. Unlike the black-box testing, white box testing involves the detailed examination of the project. Below are some functionalities that should be done in white-box testing.
1.	Testing the code of the search match functionality and identifying the best way or improving the code.
2.	Testing the authentication process through coding and checking if the functionality works as expected or not.
4.2.3	Unit Testing
In unit testing, individual components of the system are tested independently to check each component performs their functionality correctly. It's a critical process in testing; in this we tested the smallest unit of code rather than focus on the entire system.
4.2.4	Integration Testing
A Type of software testing in which individual components are integrated together and tested to ensure that they work correctly together. It ensures smooth interactions between Cric-craft components.  
4.2.4.1.1	Benefits of Integration Testing
•	Ensure Module Compatibility
•	Identify Interface Issues
•	Support Incremental Testing
4.2.4.1.2	Incorporating Integration Testing into our Project
Our integration testing strategy will include the following steps: 
•	Identify key point where system modules interact, few listed below:
•	Interaction between the front end and Node.js API server.
•	Communication protocols and API endpoints, including user authentication, payment processing, and data retrieval for recommendations, reviews, and seat selection.
•	Positive Case: Test with valid inputs, like review within character limit and correct login credentials.
•	Negative Case: Test with invalid inputs, like unsuccessful Tournament and match selection and failed API calls.
•	Boundary Case: Test edge scenarios, such as invalid credentials.
•	Ensure test cases validate end-to-end workflows.
•	Tools Used: Postman 
Simulate user actions (e.g. browse for matches) and validate the responses from the APIs.
Review test results for integration issues, such as:
•	Data inconsistencies (e.g. incorrect stats during analysis)
•	Errors in response handling (e.g. missing UI updates)
•	Document issues and track resolutions.
Conduct Tests iteratively during development to address the changes or add functionality. Refine and expand test cases as updates are made.
4.2.5	Acceptance Testing
A Type of software testing that evaluates the application meets the specified business requirements and is ready for deployment. This verifies both functional and non-functional requirements.
4.2.5.1	Benefits of Acceptance Testing
•	User Satisfaction
•	Risk Mitigation
•	Deployment Confidence
4.2.5.2	Goal of Acceptance Testing
•	Validate Cric-Craft meets the user specified and business requirements.
•	Ensure seamless integration and functionality of core modules like Match Analysis, Tournament Analysis, Pitch Analysis, Player Analysis and Match Playing XI Selection.
•	Identify any remaining issues before deploying the application to production.
4.2.5.3	Acceptance Testing for Cric Craft
Our Acceptance Testing strategy will include the following steps: 
4.2.5.3.1	Test Scenarios and Case Development
Testing of Core Modules
•	Match Analysis: Ensure that users can analyze cricket matches by reviewing detailed performance data such as runs, wickets, and other player statistics.
•	Tournament Analysis: Verify that users can view tournament-specific data, including match statistics, team performance, and tournament standings.
•	Pitch Analysis: Ensure that users can analyze pitch conditions for different matches, including data on bounce, seam movement, and turn.
•	Player Analysis: Validate that users can review detailed player performance metrics, including batting and bowling stats for each player across matches and tournaments.
•	Match Playing XI Selection: Ensure the system allows users to select the playing XI for a given match and manage player changes, considering factors like injuries or team strategies.
Verify that all Functional and Nonfunctional Requirements regarding Cric-Craft are met.
4.2.5.3.2	Acceptance Testing Execution
•	All stakeholders shall be included.
•	Use Tools like Selenium or Postman for testing automation and API validation.
•	If applicable, gather feedback through beta testing from end users.
4.2.5.3.3	Criteria for Acceptance
•	All core modules shall work without issues.
•	Achieve Functional and Non-Functional Requirements.
•	All high priority and critical bugs are resolved.
4.2.5.3.4	Deliverables
•	Approval from stakeholders
•	Resolved Issues Documentation
•	Verified test plans and execution reports.

Chapter 5.	Implementation
5.1	Work breakdown structure
 
Figure ‎5.1  Work Breakdown Structure (WBS)
Figure 5.1 outlines the major phases of the System, dividing the project into manageable sections. It includes planning, documentation, system design, front-end and back-end development, integration, testing, deployment, and project closure. Each phase is further broken down into specific tasks such as creating diagrams, developing modules, performing testing, and delivering the final product. This structure helps ensure organized and efficient project execution.










5.2	Team Roles and Responsibilities
Table ‎5.1 Team Roles and Responsibilities
Team Member	Activity
Ehtisham Ahmed Gondal	Data Base Management
Syeda Saleha Khubaib	UI/UX Design
Hafiz Mutahar Hashmi	Backend Integration
Syeda Saleha Khubaib	Web Portal Reporting
Ehtisham Ahmed Gondal	Visualization Analysis
Hafiz Mutahar Hashmi	Ball by Ball Video Mapping
Syeda Saleha Khubaib	Graphical Video Mapping
Hafiz Mutahar Hashmi	Advance Insights
Ehtisham Ahmed Gondal	Ai Integration and Fav Video Module
5.3	Gantt Chart
 
Figure ‎5.2   Gantt Chart
Figure 5.2 illustrates the complete Phases of this project according to the defined timeline to ensure the project progresses smoothly over time. It shows the Clear timeline for the project progress.
5.4	Tools and Technologies
•	The system is developed using React.js for building a fast, responsive, and interactive user interface, supported by modern CSS frameworks for clean and adaptive styling. 
•	For graphical and analytical visuals, the Canvas is used to draw, scale, and render cricket performance graphics and grid-based point mappings. 
•	On the backend, the application is powered by Node.js, handling server-side logic, API development, and authentication workflows. 
•	All system data is stored in a MySQL database, which is deployed and managed through Aiven, ensuring secure cloud-based storage and high availability.
•	Match videos and related media files are uploaded and processed through UploadThing, enabling smooth handling of large video uploads. 
•	Development is supported by tools like Git/GitHub for version control, Postman for API testing, and Jest for unit testing. 
•	The application is deployed on Vercel, providing optimized hosting and fast, reliable delivery of the React-based frontend.
5.5	Implementation Details
The implementation of the Cricket Analysis System (Cric-Craft) was carried out using a structured and technology-driven methodology to address the lack of accessible performance data and match videos for players and coaches in Pakistan. The system follows a modular full-stack architecture that allows seamless interaction between the user interface, analytics engine, backend services, database layer, and video-storage module. Each tool and technology was selected based on its suitability, performance, and role in solving the identified problem.
The frontend of Cric-Craft was implemented using React.js, which enabled the development of reusable UI components such as player dashboards, match detail pages, video access panels, and statistical summary cards. React’s virtual DOM and component-based design allowed fast rendering of dynamic cricket data. Consistent styling and responsiveness were achieved using CSS frameworks, ensuring smooth accessibility across different device screens. The Canvas API played a central role in the implementation of analytical visuals. Canvas was used to draw wagon wheels, pitch maps, heat zones, fielding grids, and ball-impact points, allowing real-time visualization of complex cricket performance metrics.
The backend of the system was implemented using Node.js, chosen for its event-driven and asynchronous architecture that supports rapid API processing and efficient data handling. RESTful APIs were developed to manage user authentication, match uploads, analytics retrieval, ball-by-ball statistics, and dashboard updates. These endpoints were thoroughly tested using Postman to validate correctness, reliability, and consistency. Several analytical algorithms were implemented on the backend to compute strike rates, boundaries percentage, partnerships, phase-wise scoring, bowling lengths, and match summaries. Backend computation ensured uniform and accurate results across all devices.
The system’s structured information—including user accounts, match metadata, ball-tracking entries, overs, performance logs, and tournament records was stored in a MySQL database. MySQL was deployed through Aiven Cloud, providing secure hosting, daily backups, remote access, and high availability. The relational database model helped maintain organized data relationships, particularly for multi-match tournaments, historical player profiles, and long-format match structures.
For video management, the system integrated UploadThing, enabling efficient uploading, processing, and retrieval of match videos. This component allowed coaches and players to review video footage within the same platform, ensuring that Cric-Craft served as both an analytical and video-analysis tool. Development work was version-controlled using Git and GitHub, ensuring safe collaboration, commit tracking, and rollback support. Jest was used to implement unit tests for backend logic, helping maintain consistent API performance and preventing regression during development cycles.
Deployment was handled using Vercel, which provided automatic builds, continuous integration, and rapid delivery of the production environment. Vercel’s integration with GitHub enabled seamless updates whenever code was pushed to the repository. As a result, the system benefited from a stable and scalable deployment pipeline suitable for real-time analytical applications. All system modules—frontend UI, visualization layer, backend API engine, database, media-storage module, and deployment infrastructure—were integrated to create a complete, reliable, and user-centric cricket analysis platform tailored to the needs of Pakistan’s players and coaches.
The architecture of Cric-Craft is designed as a layered full-stack model in which each layer performs a distinct function while remaining fully integrated with the rest of the system. 
At the top, the User Interface Layer, developed through React.js, serves as the primary interaction point for players and coaches. It displays dashboards, match summaries, performance graphs, and uploaded videos, while communicating with the backend entirely through API calls. Supporting this is the Visualization and Analytics Layer, which uses the Canvas API to convert raw ball-by-ball data into meaningful graphical insights such as wagon wheels, heat maps, pitch maps, and field-position visuals. The core processing is handled by the Backend API Layer, built on Node.js, which manages authentication, ball-by-ball calculations, match data handling, communication with the database, integration with the media storage service, and execution of statistical algorithms. All structured match information is maintained in the Database Layer, using MySQL deployed on Aiven to store player profiles, match metadata, overs, sessions, scorecards, and references for visual analytics while ensuring data integrity and high availability. Match videos and media files are handled within the Media Storage Layer, where UploadThing stores, processes, and retrieves videos and generates secure playback links for the user interface. 
Finally, the entire application is deployed through the Deployment Layer, hosted on Vercel, which manages frontend hosting, automated builds, and a continuous integration and delivery pipeline. Together, these interconnected layers create a cohesive, scalable, and efficient architecture that supports real-time cricket analysis and seamless user experience.








5.6	Screen Shots of Prototype/System 
Below are the Screen Shots of the System.
5.6.1	Authentication & Authorization
 
Figure ‎5.3 Sign in as Admin
 
Figure ‎5.4 Sign in as User
This figure 5.3 and 5.4 illustrates how a user or admin interacts with the system by filling in the required fields or credentials based on the selected role.
5.6.2	Cric Craft System
5.6.2.1	Admin Dashboard
 
Figure ‎5.5 Admin Dashboard
This figure 5.5 illustrates how an admin creates a new user—either through the "Create User" button or the "User Management" card to add or manage users. The admin can view comprehensive match analysis by clicking on the "Match Analysis" card.

5.6.2.2	Create User / Account Credentials
 
Figure ‎5.6 Credentials Form
This figure 5.6 illustrates how a user sets up an account by entering an email address and password. The user then selects a role and department from the dropdown menu. 
5.6.2.3	Create User / Personal Information
 
Figure ‎5.7 Personal Information Form
This figure 5.7 shows how a user interacts with the system after entering credentials. The user fills in personal details such as first and last names. The system then displays a summary based on the provided information

5.6.2.4	Home Page
 
Figure ‎5.8 Home Page for Admin/users
This figure 5.8 shows that once a user is registered, the system navigates to the home page, which consists of five options: Player Analysis, Match Analysis, Team Selection, Pitch Analysis, and Tournament Analysis. 
5.6.2.5	Matches Analysis Module
5.6.2.6	Filter for Match Analysis
 
Figure ‎5.9 Filter for Match Analysis
This figure 5.9 illustrates how, upon clicking on "Match Analysis," the system opens a new interface with a side panel containing various analysis tools and a filter bar. The filters include range selection, date, match format, tournament, and team selection

5.6.2.7	Match Analysis Reports
 
Figure ‎5.10  Match Analysis Reports
This figure 5.10 illustrates how the system provides reporting tools under the "Choose Matches" button once the user accesses the Match Analysis section.
5.6.2.8	Score Card Report/1st inning/Batting
 
Figure ‎5.11  Score Card Report/1st inning/Batting
This figure 5.11 shows that the user has selected the batting scorecard for the 1st inning. It displays scores and overs at the top, and a detailed table of each batsman's score, strike rate, boundary percentage, and scoring percentage. 

5.6.2.9	Score Card Report/1st inning/Extras/Fall of Wickets/Bowling
 
Figure ‎5.12   Score Card Report/1st inning/Extras/Fall of Wickets/Bowling
This figure 5.12 shows the system displaying extra runs such as wides, no-balls, leg byes, and byes. It also shows the fall of wickets with details of the score, batsman, and over. Additionally, it displays the 1st inning bowling performance.
5.6.2.10	Score Card Report/2nd inning/Batting
 
Figure ‎5.13  Score Card Report/2nd inning/Batting
This figure 5.13 is similar to the 1st inning, showing the batting scorecard for the 2nd inning. It presents scores, overs, batsman performance, strike rate, boundary percentage, and scoring percentage.

5.6.2.11	Score Card Report/2nd inning/Extras/Fall of Wickets/Bowling
 
Figure ‎5.14 Score Card Report/2nd inning/Extras/Fall of Wickets/Bowling
This figure 5.14 shows the 2nd inning data for extras, fall of wickets, and bowling, similar to the 1st inning.
5.6.2.12	Batting Graphics Stats
 
Figure ‎5.15 Batting Graphics Stats
This figure 5.15 illustrates how users can select filters and an over range to load graphical performance analysis of batsmen for that range.

5.6.2.13	Batting Graphics/Pitch maps/Beehive/Grids
 
Figure ‎5.16 Batting Graphics /Pitch map/Beehive/Grids
This figure 5.16 shows how batsman performance is displayed graphically using pitch maps, beehive charts, or grid visuals. 

5.6.2.14	Batting Graphics /Wagon Wheel/Spider/Catch Maps
 
Figure ‎5.17 Wagon Wheel

5.6.2.15	Inning Graphical Stats for Match
 
Figure ‎5.18 Inning Graphical Stats for Match
This figure 5.18 illustrates how a user selects a specific inning, over range, batter type (left, right, all), and bowler type (pace, medium, spin, all). Based on the filters, data is presented through widgets and visuals like pitch maps and wagon/spider/catch wheels. 

5.6.2.16	Bowling Graphical Stats
 
Figure ‎5.19 Bowling Graphic Stats
This figure 5.19 shows how users analyze bowling performance by selecting an inning, over range, and batter type. The system displays data in both table and graphical formats.

5.6.2.17	Over By Over Analysis
 
Figure ‎5.20 Over by Over Analysis
This figure 5.20 illustrates that after entering an over range, the system compares both innings based on the selected range. 

5.6.2.18	Ball by Ball Analysis 
 
Figure ‎5.21  Ball by Ball Analysis
This figure 5.21 shows a detailed view of each ball. The user selects the inning, over range, bowler, and batsman for analysis

5.6.2.19	Video Module Ball by Ball Analysis
 
Figure ‎5.22 Video Module Ball by Ball Analysis
This figure 5.22. illustrates how the user can view detailed information about each ball, including which bowler delivered it and which batsman faced it, supported by video. 
5.6.2.20	Edit Ball by Ball Data 
 
Figure ‎5.23 Edit Ball by Ball data
This figure 5.23 shows that users can edit ball data by clicking the "Action" button and choosing from a dropdown list, then saving the changes.

5.6.2.21	Batsman vs Bowler Analysis
 
Figure ‎5.24 Batsman vs Bowler Analysis
This figure 5.24 illustrates how the user filters data by selecting a specific batsman and bowler to analyse their head-to-head performance. 
5.6.2.22	Match Batting Statistics/Inning wise
 
Figure ‎5.25  Match Batting Statistics/Inning wise
This figure 5.25 shows the team’s batting statistics by innings and provides an option to export the data. 

5.6.2.23	Match Batting Statistics/Day wise
 
Figure ‎5.26 Match Batting Statistics/Day wise
This figure 5.26 displays batting statistics based on the day of play, with an export option. 
5.6.2.24	Match Bowling Statistics/Session wise
 
Figure ‎5.27 Match Batting Statistics/Session Wise
This figure 5.27 shows the team’s bowling stats categorized by sessions (morning, afternoon, evening), with export options. 

5.6.2.25	Match Bowling Statistics /Inning wise
 
Figure ‎5.28  Match Bowling Statistics/Inning wise
This figure 5.28 presents the team’s bowling performance by innings, along with an export option. 
5.6.2.26	Match Bowling Statistics/Day wise
 
Figure ‎5.29 Match Bowling Statistics/Day wise
This figure 5.29 displays bowling performance by day, with the ability to export data. 

5.6.2.27	Match Bowling Statistics/Session wise
 
Figure ‎5.30 Match Bowling Statistics/Session wise
This figure 5.30 shows session-wise bowling statistics with options to export the data. 
5.6.2.28	Shot Type Report
 
Figure ‎5.31  Shot Type Report
This figure 5.31 shows how users select the innings and shot type to view how many balls were played with each shot, runs made, strike rate, boundary percentage, and wicket occurrences. 

5.6.2.29	Feet Type Report
 
Figure ‎5.32  Feet Type Report
This figure 5.32 displays performance based on footwork, including balls played, runs scored, strike rate, boundary percentage, and whether wickets fell. 
5.6.2.30	Dot Ball Sequence
 
Figure ‎5.33  Dot Ball Sequence
This figure 5.33 shows consecutive dot balls played by each batsman, including total balls, dots, runs scored, and frequency of dot ball sequences. 

5.6.2.31	Batter Day Session Report
 
Figure ‎5.34  Batter Day Session Report
This figure 5.34 shows how users select innings and days. The system displays session-wise performance, including runs, balls, dot balls, and wicket count per session. 
5.6.2.32	Batter Day Session Report / Sessions
 
Figure ‎5.35 Batter Day Session Report / Sessions
This figure 5.35 highlights that on Day 1, the batsman did not play in the evening and afternoon sessions.
 
5.6.2.33	Batter Day Morning Session Report
 
Figure ‎5.36 Batter Day Morning Session Report
This figure 5.36 shows that the batsman played only during the morning session on Day 1. 
5.6.2.34	Bowler Day Session Report
 
Figure ‎5.37  Bowler Day Session Report
This figure 5.37 displays bowler performance by session, including runs conceded, balls bowled, dot balls, and wickets taken for each session on a given day. 

5.6.2.35	Bowler Day Morning Session Report
 
Figure ‎5.38 Bowler Day Session Report / Sessions
This figure 5.38 shows that the bowlers played only during the morning session on Day 1. 
5.6.2.36	Batting Over Wise Session Report
 
Figure ‎5.39   Batting Over Wise Session Report
This figure 5.39 illustrates session-based batting performance for powerplay, middle, death overs, and custom ranges. 

5.6.2.37	Batting Over Wise Session Report / Power Play
 
Figure ‎5.40 Batting Over Wise Session Report / Power Play
This figure 5.40 shows detailed batting stats for overs 1–6, including batsmen performance, runs made, and whether dismissals occurred. 
5.6.2.38	Batting Over Wise Session Report / Middle Overs
 
Figure ‎5.41 Batting Over Wise Session Report / Middle Over
This figure 5.41 presents batting performance for overs 7–15 in a T20 match. 

5.6.2.39	Batting Over Wise Session Report / Death Overs
 
Figure ‎5.42 Batting Over Wise Session Report / Death Overs
This figure 5.42 illustrates batting performance during overs 16–20, including player stats and dismissal details. 
5.6.2.40	Batting Over Wise Session Report / Custom Sessions
 
Figure ‎5.43 Batting Over Wise Session Report / Custom Session
This figure 5.43 shows performance over a custom over range (e.g., 1–90) with player-specific stats. 

5.6.2.41	Bowling Over Wise Session Report / Power Play
 
Figure ‎5.44  Bowling Over Wise Session Report /Power Play
This figure 5.44 shows bowling performance for overs 1–6, including balls delivered, runs conceded, and wickets taken. 

5.6.2.42	Bowling Over Wise Session Report / Middle Over
 
Figure ‎5.45 Bowling Over Wise Session Report / Middle Over
This figure 5.45 presents data for overs 7–15, showing bowler performance metrics. 

5.6.2.43	Bowling Over Wise Session Report / Death Over
 
Figure ‎5.46 Bowling Over Wise Session Report / Death Over
This figure 5.46 displays bowling statistics for overs 16–20. 

5.6.2.44	Bowling Over Wise Session Report / Custom Session
 
Figure ‎5.47 Bowling Over Wise Session Report / Custom Session
This figure 5.47 shows customized bowling performance analysis for any defined over range. 

5.6.2.45	Bowling Category Stats
 
Figure ‎5.48   Bowling Category Stats
This figure 5.48 shows match summary stats by bowling type (pace, medium, spin, LAO, LAUO), including runs conceded, balls delivered, and dot balls. 

5.6.2.46	Bowling Spell Wise Report
 
Figure ‎5.49   Bowling Spell Wise Report
This figure 5.49 shows how users filter data for a specific bowler’s overall performance during a match. 

5.6.2.47	Bowling Spell Wise Report / Data
 
Figure ‎5.50 Bowling Spell Wise Report / Data
This figure 5.50 focuses on uninterrupted bowling spells, filtered by bowler and inning. 

5.6.2.48	Batting Partnership
 
	Figure ‎5.51   Batting Partnership	
This figure 5.51 illustrates how data is filtered by runs, balls, and strike rate to display partnership stats. It breaks down how many runs each batsman contributed to a total. 

5.6.2.49	Bowling Partnership
 
Figure ‎5.52   Bowling Partnership
This figure 5.52 illustrates how bowling partnerships are analyzed by filtering runs conceded, balls bowled, and strike rate. It shows individual contributions of each bowler. 






5.6.2.50	Video Center
 
Figure ‎5.53   Video Center
This figure 5.53 illustrates how videos are analyzed by checking them properly according to our Stored Matches and Tournament Considering every type of players.

5.6.2.51	Highlight of Match
 
Figure ‎5.54   Highlight of Match
This figure 5.54 illustrates the highlights of any particular match in order to get it from the video center of cric craft. Selecting the match from the video center and check all the highlights of that match.
5.6.2.52	Advance Filter in Video Center
 
Figure ‎5.55   Advance Filter in Video Center
This figure 5.55 illustrates how the Different Matches videos results in filter of Batsman organizing by batter selecting over ranges and inning changer.
5.6.2.53	Favorite Video/Pages Module 
 
Figure ‎5.56 Favourite Video/Pages Module
This figure 5.56 illustrates how the user or analyst will Create Fav videos , Players and Matches so that they can easily access their favorite pages on home page easily.






5.7	Challenges During Implementation
•	Project Scope
Defining the project scope that has unique requirements, and innovation creates a lot of trouble at the start of the project.
•	Development Process
Difficulties in choosing the most suitable development process for Cric Craft. Evaluate different methodologies and their compatibility with project requirements.
•	Manage Team
Facing the challenges related to team collaboration, coordination, tasks division, and motivation.
•	UI Design Problem
Selecting the best UI design for Cric Craft is very challenging one. Getting different user opinions which one is better for the project.
•	Secure Routes
Facing route security issues. How to handle and secure our database to unauthorized users.
•	Tools and Technologies
Which tool and technologies are most suitable for the whole project. Also, which specifies tool and technology is best for specific tasks such as Graphically analyze the data from different views, creates a lot of problems for selecting the best coordinates.
Chapter 6.	Conclusion
6.1	Project Summary
Cric-Craft is a comprehensive cricket analysis system designed to bridge the gap in performance tracking between Pakistan and more advanced systems in India. It provides real-time data reports, match videos, and graphical performance insights for players and coaches. Available as both a web portal and mobile app, it enhances decision-making and player development, aiming to elevate cricket analysis standards in Pakistan. 
6.2	Recommendations for Future Work
The automated video analysis system utilizes AI-based pattern recognition to process and analyze raw cricket footage, generating reports with minimal manual intervention. Hawk-Eye, another advanced technology, focuses on AI-driven shot analysis, object tracking, and real-time performance metric calculation through machine learning techniques. Additionally, a live cricket scoring mobile application enables real-time scoring for matches across various cricket clubs, academies, and tournaments. This app not only provides instant scores but also maintains detailed records of matches and player performance, offering comprehensive reports to users. These technologies are revolutionizing the way cricket performance is analyzed and tracked 
Chapter 7.	References
Table ‎7.1 References
[1] 	"Centurion," [Online]. Available: https://centurion.cricviz.com/.
[2] 	A. Khan, "Activity recognition for quality assessment of batting shots in cricket using a hierarchical representation,," Proceedings of the ACM on Interactive, Mobile, Wearable and Ubiquitous Technologies, vol. 1, no. 3, Article 62, 2017., 2017. 
[3] 	E. I. Analytics, "Data analytics in cricket: How it’s revolutionizing strategy," Emerging India Group, March,4,2024. 
[4] 	"CricViz," [Online]. Available: https://cricviz.com/.
[5] 	"Performance Analysis of a Cricketer by Data Visualization," [Online]. Available: https://doi.org/10.22214/ijraset.2022.40176..
[6] 	 J. Vestly, "Parametric Analysis of a Cricketer’s Performance using Machine Learning Approach,," 7th International Conference on Intelligent Computing and Control Systems (ICICCS), Madurai, India, 2023, pp. 344–348, pp. 344-348, 2023. 
[7] 	S. Raajesh, "Cricket Team Selection and Player Analysis using Data Analytics,," [Online]. Available: https://ieeexplore.ieee.org/document/10689923/..
[8] 	S. K. Sharma, "A factor analysis approach in performance analysis of T-20 cricket," Journal of Reliability and Statistical Studies, vol. 6, no. 1, pp. 69–76, Jun. 2013., vol. 6, pp. 69-76, 2013. 
[9] 	"Cricks lab," [Online]. Available: https://crickslab.com/ .
[10] 	"Cric-HQ," [Online]. Available: https://crichq.com/.
[11] 	"ESPN Cricinfo," [Online]. Available: https://stats.espncricinfo.com/ci/engine/stats/ .



