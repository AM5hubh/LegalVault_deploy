> ## Documentation Index
> Fetch the complete documentation index at: https://developer.sandbox.co.in/llms.txt
> Use this file to discover all available pages before exploring further.

# Generate OTP

> Generate OTP on the individual's registered mobile number to verify their Aadhaar number.

<Card title="Run in Postman" icon="https://mintcdn.com/sandboxfinancialtechnologiesprivatelimited/gviqebbpT5NUt_6i/static/svg/Postman.svg?fit=max&auto=format&n=gviqebbpT5NUt_6i&q=85&s=da47f2b7e10d87befec951aed9468de3" horizontal arrow="true" href="https://www.postman.com/in-co-sandbox/sandbox-api/request/sz97ap6/aadhaar-offline-e-kyc-generate-otp" width="2030" height="2031" data-path="static/svg/Postman.svg" />


## OpenAPI

````yaml /api-reference/kyc/openapi.json POST /kyc/aadhaar/okyc/otp
openapi: 3.1.0
info:
  title: KYC
  version: 1.0.0
  description: ''
servers:
  - url: https://api.sandbox.co.in
  - url: https://api.sandbox.co.in
security: []
paths:
  /kyc/aadhaar/okyc/otp:
    post:
      tags:
        - kyc
        - aadhaar
      summary: Aadhaar Offline e-KYC Generate OTP
      operationId: generateOTP
      parameters:
        - name: x-api-key
          in: header
          description: API key for identification
          required: true
          example: '{{api_key}}'
          schema:
            type: string
        - name: Authorization
          in: header
          description: JWT access token
          required: true
          example: '{{access_token}}'
          schema:
            type: string
        - name: x-api-version
          in: header
          description: ''
          required: false
          example: ''
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                '@entity':
                  type: string
                  enum:
                    - in.co.sandbox.kyc.aadhaar.okyc.otp.request
                aadhaar_number:
                  type: string
                  description: >-
                    12-digit Aadhaar number of the individual for whom the OTP
                    will be generated. Must contain exactly 12 numeric digits
                    with no spaces or separators.
                  minLength: 12
                  maxLength: 12
                  pattern: ^[0-9]{12}$
                consent:
                  type: string
                  enum:
                    - 'Y'
                    - 'y'
                  description: >-
                    Explicit consent from the end user to use their Aadhaar
                    details for OTP-based verification. Must be passed as "Y" or
                    "y" to proceed.
                reason:
                  type: string
                  description: >-
                    Purpose for initiating Aadhaar OTP verification, such as
                    identity verification or KYC compliance. Used for audit,
                    compliance, and request traceability.
              required:
                - '@entity'
                - aadhaar_number
                - consent
                - reason
            example:
              '@entity': in.co.sandbox.kyc.aadhaar.okyc.otp.request
              aadhaar_number: '123456789012'
              consent: 'y'
              reason: For KYC
        required: true
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  timestamp:
                    type: integer
                  transaction_id:
                    type: string
                    format: uuid
                  data:
                    type: object
                    properties:
                      '@entity':
                        type: string
                        const: in.co.sandbox.kyc.aadhaar.okyc.otp.response
                      reference_id:
                        type: integer
                      message:
                        type: string
                    required:
                      - '@entity'
                      - reference_id
                      - message
                required:
                  - data
                  - transaction_id
                  - timestamp
                  - code
              example:
                code: 200
                timestamp: 1774527050727
                transaction_id: 756c78eb-091c-4528-b3f1-185ed7df2a51
                data:
                  '@entity': in.co.sandbox.kyc.aadhaar.okyc.otp.response
                  reference_id: 1234567
                  message: OTP sent successfully
          headers: {}
        '422':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  timestamp:
                    type: integer
                  transaction_id:
                    type: string
                    format: uuid
                  message:
                    type: string
                required:
                  - transaction_id
                  - timestamp
                  - code
                  - message
              example:
                code: 422
                timestamp: 1769089363000
                transaction_id: dcd84555-6c6a-41ad-9249-a4f5ccfac1d3
                message: Invalid Aadhaar number pattern
          headers: {}
        '503':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  timestamp:
                    type: integer
                  transaction_id:
                    type: string
                    format: uuid
                  message:
                    type: string
                required:
                  - code
                  - timestamp
                  - transaction_id
                  - message
              example:
                code: 503
                timestamp: 1769089498000
                transaction_id: dcd84555-6c6a-41ad-9249-a4f5ccfac1d3
                message: Source Unavailable
          headers: {}
      deprecated: false
      security: []

````

Built with [Mintlify](https://mintlify.com).




> ## Documentation Index
> Fetch the complete documentation index at: https://developer.sandbox.co.in/llms.txt
> Use this file to discover all available pages before exploring further.

# Verify Aadhaar OTP

> Verify the Aadhaar number by passing the OTP received on the individual's registered mobile number.

<Card title="Run in Postman" icon="https://mintcdn.com/sandboxfinancialtechnologiesprivatelimited/gviqebbpT5NUt_6i/static/svg/Postman.svg?fit=max&auto=format&n=gviqebbpT5NUt_6i&q=85&s=da47f2b7e10d87befec951aed9468de3" horizontal arrow="true" href="https://www.postman.com/in-co-sandbox/sandbox-api/request/jr5gzo1/aadhaar-offline-e-kyc-verify-otp" width="2030" height="2031" data-path="static/svg/Postman.svg" />


## OpenAPI

````yaml /api-reference/kyc/openapi.json POST /kyc/aadhaar/okyc/otp/verify
openapi: 3.1.0
info:
  title: KYC
  version: 1.0.0
  description: ''
servers:
  - url: https://api.sandbox.co.in
  - url: https://api.sandbox.co.in
security: []
paths:
  /kyc/aadhaar/okyc/otp/verify:
    post:
      tags:
        - kyc
        - aadhaar
      summary: Aadhaar Offline e-KYC Verify OTP
      operationId: verifyOTP
      parameters:
        - name: x-api-key
          in: header
          description: API key for identification
          required: true
          example: '{{api_key}}'
          schema:
            type: string
        - name: Authorization
          in: header
          description: JWT access token
          required: true
          example: '{{access_token}}'
          schema:
            type: string
        - name: x-api-version
          in: header
          description: ''
          required: false
          example: ''
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                '@entity':
                  type: string
                  const: in.co.sandbox.kyc.aadhaar.okyc.request
                reference_id:
                  type: string
                  description: >-
                    Unique reference identifier returned by the [Generate OTP
                    API](https://developer.sandbox.co.in/api-reference/kyc/aadhaar/endpoints/generate_otp)
                    for this Aadhaar verification flow. Used to correlate the
                    OTP submission with the original request.
                otp:
                  type: string
                  description: >-
                    6-digit one-time password sent to the mobile number linked
                    with the Aadhaar. Must be entered exactly as received and is
                    valid only for the associated reference_id.
                  pattern: ^[0-9]{6}$
                  minLength: 6
                  maxLength: 6
              required:
                - '@entity'
                - reference_id
                - otp
            example:
              '@entity': in.co.sandbox.kyc.aadhaar.okyc.request
              reference_id: '9020131'
              otp: '361679'
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  timestamp:
                    type: integer
                  transaction_id:
                    type: string
                  data:
                    type: object
                    properties:
                      '@entity':
                        type: string
                        const: in.co.sandbox.kyc.aadhaar.okyc
                      reference_id:
                        type: integer
                      status:
                        type: string
                      message:
                        type: string
                      care_of:
                        type: string
                      full_address:
                        type: string
                      date_of_birth:
                        type: string
                      email_hash:
                        type: string
                      gender:
                        type: string
                      name:
                        type: string
                      address:
                        type: object
                        properties:
                          '@entity':
                            type: string
                          country:
                            type: string
                          district:
                            type: string
                          house:
                            type: string
                          landmark:
                            type: string
                          pincode:
                            type: string
                          post_office:
                            type: string
                          state:
                            type: string
                          street:
                            type: string
                          subdistrict:
                            type: string
                          vtc:
                            type: string
                        required:
                          - '@entity'
                          - country
                          - district
                          - house
                          - landmark
                          - pincode
                          - post_office
                          - state
                          - street
                          - subdistrict
                          - vtc
                      year_of_birth:
                        type: string
                      mobile_hash:
                        type: string
                      photo:
                        type: string
                      share_code:
                        type: string
                    required:
                      - '@entity'
                      - reference_id
                      - status
                      - message
                      - care_of
                      - full_address
                      - date_of_birth
                      - email_hash
                      - gender
                      - name
                      - address
                      - year_of_birth
                      - mobile_hash
                      - photo
                      - share_code
                required:
                  - code
                  - timestamp
                  - transaction_id
                  - data
              examples:
                Success:
                  summary: Success
                  value:
                    code: 200
                    timestamp: 1769090090000
                    transaction_id: 439d3c58-e97b-46c3-bb85-4b113be87451
                    data:
                      '@entity': in.co.sandbox.kyc.aadhaar.okyc
                      reference_id: 1234567
                      status: VALID
                      message: Aadhaar Card Exists
                      care_of: 'S/O: Johnny Doe'
                      full_address: >-
                        Mangal Kanaka Niwas, Main Cross 3rd, Bengaluru,
                        Bengaluru-Karnataka, India 
                      date_of_birth: 21-04-1985
                      email_hash: 044917e2c4c62a439d068.......d9f71bbde10b1d227a914e
                      gender: M
                      name: John Doe
                      address:
                        '@entity': in.co.sandbox.kyc.aadhaar.okyc.address
                        country: India
                        district: Bengaluru
                        house: Mangal Kanaka Niwas
                        landmark: ''
                        pincode: '581615'
                        post_office: Bengaluru
                        state: Karnataka
                        street: Main Cross 3rd
                        subdistrict: ''
                        vtc: Bengaluru
                      year_of_birth: '1985'
                      mobile_hash: 044917e2c4c62a439d068.......d9f71bbde10b1d227a914e
                      photo: data:image/jpeg;base64,/9j/4AAQSk.......mj/2Q==
                      share_code: '1234'
                Invalid OTP:
                  summary: Invalid OTP
                  value:
                    code: 200
                    timestamp: 1774528579926
                    transaction_id: c7d38597-bb0e-4783-9728-3264d1699721
                    data:
                      '@entity': in.co.sandbox.kyc.aadhaar.okyc
                      message: Invalid OTP
                OTP Expired:
                  summary: OTP Expired
                  value:
                    code: 200
                    timestamp: 1774528668242
                    transaction_id: 598a5c6d-ab4c-47cd-9ef7-39b8d885f28f
                    data:
                      '@entity': in.co.sandbox.kyc.aadhaar.okyc
                      message: OTP Expired
                Request under process:
                  summary: Request under process
                  value:
                    code: 200
                    timestamp: 1774528696590
                    transaction_id: 19927295-e2b8-4f7b-a2f0-e81eca85ff7c
                    data:
                      '@entity': in.co.sandbox.kyc.aadhaar.okyc
                      message: Request under process, please try after 30 seconds
          headers: {}
        '422':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  timestamp:
                    type: integer
                  transaction_id:
                    type: string
                  message:
                    type: string
                required:
                  - code
                  - timestamp
                  - transaction_id
                  - message
              example:
                code: 422
                timestamp: 1769090164000
                transaction_id: 439d3c58-e97b-46c3-bb85-4b113be87451
                message: OTP missing in request
          headers: {}
        '503':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  timestamp:
                    type: integer
                  transaction_id:
                    type: string
                    format: uuid
                  message:
                    type: string
                required:
                  - code
                  - timestamp
                  - transaction_id
                  - message
              example:
                code: 503
                timestamp: 1769090164000
                transaction_id: 439d3c58-e97b-46c3-bb85-4b113be87451
                message: Source Unavailable
          headers: {}
      deprecated: false
      security: []

````

Built with [Mintlify](https://mintlify.com).