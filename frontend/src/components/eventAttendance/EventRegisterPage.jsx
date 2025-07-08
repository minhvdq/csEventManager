import {useState, useEffect} from 'react'
import { Select, Switch, Button, Form, Input, Spin, message} from 'antd';
import studentService from '../../services/student';

export default function EventRegisterPage({event}) {
    const [pageNumber, setPageNumber] = useState(1)
    const [curStudent, setCurStudent] = useState(null)
    const [needUpdateResume, setNeedUpdateResume] = useState(false)
    const [needUpdateMajor, setNeedUpdateMajor] = useState(false)
    
    const [email, setEmail] = useState("")

    const curTime = Date.now()
    useEffect(() => {
        const curMonth = curTime.getMonth() + 1
        const isNowFall = curMonth >= 7 && curMonth <= 12
        if(!curStudent){
            setNeedUpdateMajor(false)
            return
        }

        const studentLastUpdateMonth = curStudent.last_update.getMonth() + 1
        const studentLastUpdateIsFall = studentLastUpdateMonth >= 7 && studentLastUpdateMonth <= 12
        
        if(curTime.getFullYear() == student.last_update.getFullYear()){
            setNeedUpdateMajor(studentLastUpdateIsFall === isNowFall)
        }else{
            setNeedUpdateMajor(false)
        }
    }, [curStudent])

    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        
        const checkStudentResponse = await studentService.getByEmail(email)

        if(!checkStudentResponse.exists){
            setPageNumber(3)
        }else{
            setCurStudent(checkStudentResponse.student)
            setPageNumber(2)
        }
    }

    const EmailCheckForm = () => {
        return(
            <div>
                <Form onFinish={handleEmailSubmit}>
                    <Form.Item label="School Email" required>
                        <Input 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Item>
                </Form>
            </div>
        )
    }

    const RegisterNewUserForm = () => {
        const [firstName, setFirstName] = useState("")
        const [lastName, setLastName] = useState("")
        const [schoolId, setSchoolId] = useState("")
        const [classYear, setClassYear] = useState("")
        const [taken216, setTaken216] = useState(null)
        const [resumeTitle, setResumeTitel] = useState(null)
        const [resume, setResume] = useState(null)

        return(
            <>
                <Form>
                    <Form.Item label="First Name" required>
                        <Input 
                            value={firstName}
                            onChange={(e) => {setFirstName(e.target.value)}}
                        />
                    </Form.Item>

                    <Form.Item label="Last Name" required>
                        <Input 
                            value={lastName}
                            onChange={(e) => {setLastName(e.target.value)}}
                        />
                    </Form.Item>

                    <Form.Item label="School ID" required>
                        <Input 
                            value={schoolId}
                            onChange={(e) => {setSchoolId(e.target.value)}}
                        />
                    </Form.Item>

                    <Form.Item label="Class Year" required>
                        <Input 
                            value={classYear}
                            onChange={(e) => setClassYear(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item label="Have you taken 216?" required>
                        <Input 
                            value={taken216}
                            onChange={(e) => setTaken216(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item label="Upload your resume" required>
                        <Input 
                            
                            onChange={() => {}}
                        />
                    </Form.Item>
                </Form>
            </>
        )
    }

    const RegisterExistingUserForm = () => {
        
        return(
            <>
                <Form>
                    <Form.Item>
                        const
                    </Form.Item>
                </Form>
            </>
        )
    }

    return(
        <div>
            {pageNumber == 1 && <EmailCheckForm />}
            {pageNumber == 2 && (needUpdateMajor || needUpdateResume) && <RegisterExistingUserForm />}
            {pageNumber == 3 && <RegisterNewUserForm />}
        </div>
    )
}